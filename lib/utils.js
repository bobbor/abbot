const chalk = require('chalk');
const log = require('debug')('jenkins:utils');
const spinners = require('cli-spinners');
const spinner = spinners.bounce;
let statusCounter = -1;
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
const getStateIcon = (state, result) => {
  if(state === 'building') {
    statusCounter = (statusCounter + 1) % spinner.frames.length;
    return spinner.frames[statusCounter];
  } else {
    if (result === 'SUCCESS') {
      return chalk`{greenBright ✔}`;
    }
    if (result === 'FAILURE') {
      return chalk`{redBright ✖}`;
    }
    if (result === 'ABORTED') {
      return chalk`{gray ●}`;
    }
    return result;
  }
};
const getHumanReadableTime = (duration) => {
  let idx = 0;
  const nums = [];
  const intervals = [1000, 60, 60, 24];
  const names = ['ms', 's', 'm', 'h', 'd'];
  while(duration > 0 && idx < intervals.length) {
    nums[idx] = duration % intervals[idx];
    duration -= nums[idx];
    duration /= intervals[idx];
    idx++;
  }

  const times = nums.map((num, idx) => {
    return `${num}${names[idx]}`;
  }).reverse();
  times.pop();
  return times.join(' ');
};
const printJobState = (state, initial) => {
  log('printing', state);
  let duration;
  if(!state) { return; }
  if(state.duration) {
    duration = state.duration
  } else {
    duration = Date.now() - state.timestamp;
  }
  if (!(!state.building && initial)) {
    console.clear();
  }
  console.log(chalk`
${state.url}

${getStateIcon(state.state, state.result)} {blue.bold.underline ${state.name}} ${getHumanReadableTime(duration)} (${getHumanReadableTime(state.estimatedDuration)})
`);
};

module.exports = {
  formatResult,
  getHumanReadableTime,
  printJobState
};