const url = require('url');
const fetch = require('node-fetch');
const log = require('debug')('jenkins:net')

const checkStateGenerator = (credentials, project) => {
  log('building request');
  log(credentials, project);
  // parse the location of the jekins instance
  const apiURLObject = url.parse(credentials.jenkins);

  // if a user is specified, put it on the auth property
  if(credentials.user) { apiURLObject.auth = credentials.user; }
  if(credentials.user && credentials.token) { apiURLObject.auth += `:${credentials.token}` }

  // set the api path for the specified job
  apiURLObject.pathname += `/job/${project.job}/${project.build}/api/json`;

  //specify the fields we want to get from the api
  apiURLObject.query = {
    tree: 'result,estimatedDuration,duration,building,fullDisplayName,url,timestamp'
  };
  log(apiURLObject);

  // form a string from the URLObject
  const apiURL = url.format(apiURLObject);

  return async () => {
    log('fetching', apiURL);
    const fetchResult = await fetch(apiURL);
    if(!fetchResult.ok) {
      if(fetchResult.status === 404) {
        throw new Error(`Job "${project.job} #${project.build}" could not be found`);
      }
      throw new Error('Jenkins is not reachable');
    }
    return await fetchResult.json()
  };
};

module.exports = {
  checkStateGenerator
};