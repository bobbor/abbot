import fetch from './lib/fetch.mjs'

export default (options, instances) => {
  const { instance, user, token } = instances[options.instance]
  const { build, job } = options
  return fetch({ instance, user, token, build, job })
}
