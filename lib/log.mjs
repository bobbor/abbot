import { of } from 'rxjs'
import { asapScheduler } from 'rxjs'
import chalk from 'chalk'
import { getTimeInfo } from './utils.mjs'
import printer from './print.mjs'
import notify from './notify.mjs'

const formatResult = (result) => {
  switch(result){
    case 'success':
      return 'succeeded'
    case 'failure':
      return `failed`;
    case 'aborted':
      return `was aborted`;
    default:
      return result
  }
}
const formatErr = ({ message, details }) => {
  return chalk`{redBright.bold.underline ${message}}\n${details}`
}
const formatState = (state) => {
  const name = chalk`{blue.bold.underline ${state.name}}`
  const {
    duration,
    estimated,
    remaining
  } = getTimeInfo(state, state.duration || (Date.now() - state.timestamp))
  let timeStr
  if(state.building) {
    if(duration.__ <= remaining.__) {
      timeStr = `builds for ${duration.nice}`
    } else if (remaining.__ > 15000) {
      timeStr = `${remaining.nice} remaining`
    } else if (remaining.__ < -15000) {
      timeStr = chalk`takes {redBright.bold ${remaining.nice}} longer than expected (${estimated.nice})`
    } else {
      timeStr = 'is done any moment'
    }
  } else {
    timeStr = chalk`${formatResult(state.result)} after ${duration.nice}`
  }
  return `${name}
  ${timeStr}
  ${state.url}`
}

const formatNotify = (state) => {
  const {
    duration
  } = getTimeInfo(state, state.duration || (Date.now() - state.timestamp))
  return {
    message: `${formatResult(state.result)} after ${duration.nice}`,
    title: state.name,
    result: state.result
  }
}


const mkLog = () => {
  let state = {}
  const { update, end } = printer()

  function task(pending) {
    const that = this
    if(!('ok' in state)) {
      that.schedule(false, 1000)
      return
    }

    if(state.ok) {
      const { data } = state
      if(data.building) {
        update(formatState(data))
        that.schedule(true, 1000)
      } else {
        end(data.result, formatState(data))
        if(pending) {
          notify(formatNotify(data))
        }
      }
    } else {
      const { error } = state
      end('error', formatErr(error))
    }
  }

  asapScheduler.schedule(task)

  return (data) => {
    state = data
    return of(state)
  }
}

export default mkLog
