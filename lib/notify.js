const { exec } = require('child_process');
const {formatResult, getHumanReadableTime} = require('./utils');
const path = require('path');
const beep = require('beepbeep');

const notify = (state) => {
  const imageFolder = path.resolve(__dirname, '..', 'assets');
  const title = formatResult(state.result);
  const message = state.name;
  const jenkins = path.resolve(imageFolder, 'headshot.png');
  let image;
  if(state.result === 'SUCCESS') {
    image = path.resolve(imageFolder, 'green.png')
  } else if(state.result === 'FAILURE') {
    image = path.resolve(imageFolder, 'red.png')
  } else {
    image = path.resolve(imageFolder, 'aborted.png')
  }
  beep();
  exec(`terminal-notifier -open "${state.url}" -subtitle "${message}" -title "${title}" -message "${getHumanReadableTime(state.duration)}" -sound default -contentImage ${image} -appIcon ${jenkins} -group "jenkins-notifier"`);
};

module.exports = {
  notify
};