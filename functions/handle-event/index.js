import Promise from 'bluebird'
import { listener } from '../../lib/listener'
import { publish as snsPublish } from '../../lib/sns'
import { scanTimeout } from '../../lib/config'
import { tarballUrl } from '../../lib/registry'
import { savePackageInfo } from '../../lib/pkgs'

export function handler (event, context, callback) {
  Promise
    .resolve(event.Records)
    .map(processEvent, { concurrency: 1 })
    .then(() => undefined)
    .asCallback(callback)
}

const events = {
  timer: scanAndPublish,
  detect: savePackageInfo
}

function processEvent (record) {
  const data = JSON.parse(record.Sns.Message)
  if (typeof events[data.type] === 'function') {
    return events[data.type](data)
  } else {
    console.error(`Unknown event type ${data.type}`, record.Sns.Message)
  }
}

async function scanAndPublish (data) {
  const stream = await listener(newPackage)
  console.log(`Processing NPM registry Stream from ${stream.sequence()}`)
  await Promise.delay(scanTimeout)
  console.log(`Quiting after ${scanTimeout / 1000} seconds`)
  console.log(`Processed NPM registry Stream to ${stream.sequence()}`)
  stream.end()
}

function newPackage (newPackage) {
  const doc = newPackage.doc
  const { name, versions } = doc
  if (!name || typeof versions !== 'object') {
    return
  }

  return Promise.map(Object.keys(versions), async version => {
    const url = await tarballUrl(name, version, doc)
    return snsPublish({
      type: 'detect',
      data: { name, version, url }
    })
  })
}
