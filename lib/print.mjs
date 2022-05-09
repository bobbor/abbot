import ora from 'ora'
import chalk from 'chalk'

export default () => {
  const spinner = ora({
    text: 'checking',
    spinner: 'line'
  }).start();

  return {
    update: (msg) => {
      spinner.text = msg
    },
    end: (result, msg) => {
      if(result === 'success') {
        spinner.succeed(msg)
      } else if(result === 'failure' || result === 'error') {
        spinner.fail(msg)
      } else {
        spinner.stopAndPersist({
          symbol: chalk`{gray ●}`,
          text: msg
        })
      }
    }
  }
}
