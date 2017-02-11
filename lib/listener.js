import Promise from 'bluebird'
import changes from 'concurrent-couch-follower'
import { concurrency } from './config'
import { settings } from './db'
import logger from './logger'

const debug = logger('listener')

const saveEventId = seq => settings.set('registry-last-event-id', seq)
const getEventId = () => settings
  .get('registry-last-event-id')
  .catch({ code: 'NoSuchKey' }, e => undefined)

const createListener = (eventId = 0, concurrency = 1, processChange) => {
  if (typeof processChange !== 'function') {
    throw TypeError('"processChange" is not a function')
  }

  const stream = changes(async (data, done) => {
    try {
      await Promise.resolve(processChange(data))
    } catch (err) {
      console.error(`Error processing ${JSON.stringify(data)}`)
      console.error(err)
    }
    done()
  }, {
    db: 'https://skimdb.npmjs.com/registry',
    include_docs: true,
    since: eventId,
    sequence: async (id, cb) => {
      try {
        debug('saveEventId', id)
        await saveEventId(id)
        cb()
      } catch (err) {
        stream.end()
        console.error(`Error saving sequence "${id}", stopping processing`)
        console.error(err)
        process.exit(1)
      }
    },
    concurrency,
    timeout: 10
  })

  return stream
}

export async function listener (cb) {
  const id = await getEventId()
  debug('Listener starting with id:', id)
  return createListener(id, concurrency, cb)
}
