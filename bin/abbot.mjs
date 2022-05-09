#!/usr/bin/env node
import { parse } from 'toml'
import { readFileSync } from 'fs'
import minimist from 'minimist'
import { of } from 'rxjs'
import { switchMap, catchError, tap } from 'rxjs/operators'

import worker from '../index.mjs'
import mkLog from '../lib/log.mjs'
import notify from '../lib/notify.mjs'

const argv = minimist(process.argv.slice(2))

const {
  ABBOT_INSTANCE,
  ABBOT_BUILD,
  ABBOT_JOB
} = process.env

const parseOpts = () => {
  const { i, instance, b, build, j, job } = argv
  const opts = {
    instance: i ?? instance ?? ABBOT_INSTANCE,
    build: b ?? build ?? ABBOT_BUILD ?? 'lastBuild',
    job: j ?? job ?? ABBOT_JOB
  }

  if(!opts.job) { throw new Error('a job is required') }
  return opts
}
const getConfig = () => {
  const xdg_config_home = process.env.XDG_CONFIG_HOME || `${process.env.HOME}/.config`
  const configuration = readFileSync(`${xdg_config_home}/abbot/config`)
  return parse(configuration)
}

try { 
  const opts = parseOpts()
  const config = getConfig()
  let _ = {}

  const log = mkLog()
  worker(opts, config).pipe(
    switchMap((data) => {
      _ = { ok: true, error: null, data }
      return log(_)
    }),
    catchError((error) => log({ ok: false, error, data: null })),
  ).subscribe()
} catch(err)  {
  console.log(err.message)
  process.exit(1)
}
