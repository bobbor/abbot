const url = require('url');
const fetch = require('node-fetch');
const log = require('debug')('jenkins:net')

const checkStateGenerator = (credentials, project) => {
  log('building request');
  log(credentials, project);
  const jenkins = url.parse(credentials.jenkins);
  let login = '';
  if(credentials.user) {
    login += credentials.user;
  }
  if(credentials.user && credentials.token) {
    login += ':' + credentials.token;
  }
  if(login) {
    login += '@';
  }
  const domain = `${jenkins.protocol}//${login}${jenkins.hostname}/job/`;
  const api = "/api/json?tree=result,estimatedDuration,duration,building,fullDisplayName,url,timestamp";

  log(`${domain}${project.project}/${project.job}${api}`)
  return async () => {
    log('fetching', `${domain}${project.project}/${project.job}${api}`);
    const fetchResult = await fetch(`${domain}${project.project}/${project.job}${api}`);
    if(!fetchResult.ok) {
      if(fetchResult.status === 404) {
        throw new Error(`Project (${project.project}) or Job (${project.job}) could not be found`);
      }
      throw new Error('Jenkins is not reachable');
    }
    return await fetchResult.json()
  };
};

module.exports = {
  checkStateGenerator
};