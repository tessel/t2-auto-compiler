import Promise from 'bluebird'
import { listener } from './listener'
import { publish } from './sns'
import { scanTimeout } from './config'

function newPackage (newPackage) {
  const doc = newPackage.doc
  if (!doc.name || typeof doc.versions !== 'object') {
    return
  }
  return Promise.all(Object.keys(doc.versions).map(version => {
    return publish({
      type: 'published',
      data: {
        name: doc.name,
        version: version
      }
    })
  }))
}

export default async function timer (event) {
  const stream = await listener(newPackage)
  console.log(`Processing NPM registry Stream from ${stream.sequence()}`)
  await Promise.delay(scanTimeout)
  console.log(`Quiting after ${scanTimeout / 1000} seconds`)
  console.log(`Processed NPM registry Stream to ${stream.sequence()}`)
  stream.end()
}
