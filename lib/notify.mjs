import { URL } from 'url'
import { exec } from 'child_process'
import { humanTime } from './utils.mjs'
import { resolve, dirname } from 'path'

export default ({message, title, result }) => {
  const dir = dirname(import.meta.url)
  const path = new URL(dir).pathname
  const imageFolder = resolve(path, '..', 'assets')
  const jenkins = resolve(imageFolder, 'headshot.png')
  let image, cmd
  if(result === 'success') {
    image = resolve(imageFolder, 'green.png')
  } else if(result === 'failure') {
    image = resolve(imageFolder, 'red.png')
  } else {
    image = resolve(imageFolder, 'aborted.png')
  }
  cmd = `notify-send -a "Abbot" -i ${image} "Abbot" "${title}\n${message}"`
  try {
    exec(cmd)
  } catch(o_O) {}
};
