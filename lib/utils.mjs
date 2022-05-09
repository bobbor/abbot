import chalk from 'chalk'
export const pad = num => num < 10 ? `0${num}` : `${num}`;

export const humanTime = (duration) => {
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
}

export const getTimeInfo = (state, duration) => {
  let remaining = state.estimatedDuration - duration;
  return {
    estimated: {
      __: state.estimatedDuration,
      nice: humanTime(state.estimatedDuration)
    },
    duration: {
      __: duration,
      nice: humanTime(duration)
    },
    remaining: {
      __: remaining,
      nice: humanTime(Math.abs(remaining))
    }
  }
};
