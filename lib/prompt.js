const fs = require('fs');
const inquirer = require('inquirer');
const rc = require('rc');
const omit = require('lodash.omit');
const args = require('minimist')(process.argv.slice(2));
const log = require('debug')('jenkins:prompt');

const newInstance = async () => {
  const newInstance = await inquirer.prompt([{
    type: 'input',
    name: 'jenkins',
    message: 'provide your jenkins instance (e.g. https://app.jenkins.net)'
  }, {
    type: 'input',
    name: 'user',
    message: 'provide your user login (leave blank for none)',
  }, {
    type: 'password',
    name: 'token',
    when(hash) { return !!hash.user; },
    message: 'provide your jenkins credentials (leave blank for none)'
  }, {
    type: 'input',
    name: 'name',
    default(hash) { return hash.jenkins; },
    message: 'a name for this instance (will be url if blank)'
  }]);

  const credentials_rc = rc('jenkins');
  const credentials = omit(credentials_rc, ['config', 'configs', '_', 'defaults']);
  credentials.instances = credentials.instances || [];
  credentials.instances.push(newInstance);
  fs.writeFileSync(`${process.env.HOME}/.jenkinsrc`, JSON.stringify(credentials));

  return await promptForInstance();
};
const promptForInstance = async () => {
  const credentials_rc = rc('jenkins');
  const credentials = omit(credentials_rc, ['config', 'configs', '_', 'defaults']);
  const {instance: instanceArg} = args;
  log('promptForCredentials start');
  credentials.instances = credentials.instances || [];
  log('instances', credentials.instances)
  const selected = credentials.instances.filter((instance, idx) => instance.name === instanceArg || instance.jenkins === instanceArg || instanceArg === (idx+1))[0];
  log(selected);
  if(selected) {
    return selected;
  }

  const question = {
    type: 'list',
    message: 'Please pick an instance',
    name: 'instance',
    choices: []
  };
  credentials.instances.forEach(instance => {
    if(!question.default) {
      question.default = instance.name
    }
    question.choices.push(instance.name)
  });

  question.choices.push(new inquirer.Separator());
  question.choices.push({name: 'Add a new instance', value: '__new'});
  const answer = await inquirer.prompt([question]);
  if(answer.instance === '__new') {
    return await newInstance();
  }
  return credentials_rc.instances.filter(instance => instance.name === answer.instance)[0];
};
const promptForProject = async () => {
  log('promptForProject start');
  const {job, build} = args;
  const questions = [];
  if(!job) {
    questions.push({
      type: 'input',
      name: 'job',
      validate(job) {return !!job;},
      message: 'which job to poll'
    });
  }
  if(!build) {
    questions.push({
      type: 'input',
      name: 'build',
      default: 'lastBuild',
      message: 'specify a build'
    });
  }
  if(questions.length) {
    const answers = await inquirer.prompt(questions);
    log('promptForProject end with questions');
    log(answers);
    return Object.assign({}, {job, build}, answers);
  }
  log('promptForProject end without questions');
  log(job);
  log(build);
  return {job, build};
};

module.exports = {
  promptForInstance,
  promptForProject
};