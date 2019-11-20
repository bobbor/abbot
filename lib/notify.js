const { exec } = require('child_process');
const {formatResult, getHumanReadableTime} = require('./print');
const path = require('path');
const beep = require('beepbeep');

const notify = (state) => {
  const imageFolder = path.resolve(__dirname, '..', 'assets');
  const title = formatResult(state.result);
  const message = state.name.split('»').pop().trim();
  const jenkins = path.resolve(imageFolder, 'headshot.png');
  let image, cmd;
  if(state.result === 'SUCCESS') {
    image = path.resolve(imageFolder, 'green.png')
  } else if(state.result === 'FAILURE') {
    image = path.resolve(imageFolder, 'red.png')
  } else {
    image = path.resolve(imageFolder, 'aborted.png')
  }
  beep();

    if(process.platform === 'darwin') {
      cmd = `terminal-notifier -open "${state.url}" -subtitle "${message}" -title "${title}" -message "${getHumanReadableTime(state.duration)}" -sound default -contentImage ${image} -appIcon ${jenkins} -group "jenkins-notifier"`;
    } else if (process.platform === 'linux') {
      const m = message.length > 40 ? message.substring(0, 37).concat('...') : message
      cmd = `notify-send -a "Abbot" -i ${image} "Abbot" "${title} (${getHumanReadableTime(state.duration)})\n${m}"`
    }
  try {
    exec(cmd)
  } catch(o_O) {}
};

module.exports = {
  notify
};
