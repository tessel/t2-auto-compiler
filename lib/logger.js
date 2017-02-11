import debug from 'debug'

export default function logger (module) {
  return debug(`t2c:${module}`)
}
