const chalk = require('chalk');
const log = require('debug')('jenkins:utils');

const formatResult = (result) => {
  if(result === 'SUCCESS') {
    return `✔ Success`;
  }
  if(result === 'FAILURE') {
    return `✖ Failure`;
  }
  if(result === 'ABORTED') {
    return `✖ aborted`;
  }
  return result
};
const pad = num => num < 10 ? `0${num}` : `${num}`;

const getHumanReadableTime = (duration) => {
  let idx = 0;
  const nums = [];
  const intervals = [1000, 60, 60, 24*365];
  const names = ['ms', 's', 'm', 'h'];
  while(duration > 0 && idx < intervals.length) {
    nums[idx] = duration % intervals[idx];
    duration -= nums[idx];
    duration /= intervals[idx];
    idx++;
  }

  const times = nums.map((num, idx, all) => {
    return `${(idx !== all.length-1) ? pad(num) : num}${names[idx]}`;
  }).reverse();
  times.pop();
  return times.join('');
};
const getTimeInfo = (state, duration) => {
  let remaining = state.estimatedDuration - duration;
  if(state.building) {
    return `${remaining < -20000 ? 
        chalk`${getHumanReadableTime(Math.abs(remaining))} {redBright overtime}` : 
        remaining < 20000 ? 
            'any moment' : 
            `${getHumanReadableTime(remaining)} left`}`
  } else {
    return `${getHumanReadableTime(duration)}`
  }
};
const printer = () => {
  const ora = require('ora');
  const spinner = ora({
    text: 'checking',
    spinner: 'line'
  }).start();
  
  return (state) => {
    log('printing', state);
    let duration;
    if(!state) { return; }
    if(state.duration) {
      duration = state.duration
    } else {
      duration = Date.now() - state.timestamp;
    }

    if(state.building) {
      spinner.text = chalk`{blue.bold.underline ${state.name}} ${getTimeInfo(state, duration)}
  ${state.url}`;
    } else if(state.result === 'SUCCESS') {
      spinner.succeed(chalk`{blue.bold.underline ${state.name}} succeeded after ${getTimeInfo(state, duration)}
  ${state.url}`);
    } else if (state.result === 'ABORTED') {
      spinner.stopAndPersist({
        symbol: chalk`{gray ●}`,
        text: chalk`{blue.bold.underline ${state.name}} was aborted after ${getTimeInfo(state, duration)}
  ${state.url}`
      });
    } else {
      spinner.fail(chalk`{blue.bold.underline ${state.name}} failed after ${getTimeInfo(state, duration)}
  ${state.url}`);
    }
  }
};

module.exports = {
  formatResult,
  getHumanReadableTime,
  printer
};