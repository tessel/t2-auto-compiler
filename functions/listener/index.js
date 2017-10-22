import AWS from 'aws-sdk'
const kinesis = new AWS.Kinesis()
const StreamName = 't2-compiler-packages'

export function handler (event, context, callback) {
  asyncHandler(event, context).then(data => callback(null, data), callback)
}

async function asyncHandler (event, context) {
  await enquePackage({
    name: 'serialport',
    version: '6.0.5'
  })
  await enquePackage({
    name: 'lodash',
    version: '4.16.1'
  })
  await enquePackage({
    name: 'serialport',
    version: '9'
  })
}

async function enquePackage ({ name, version }) {
  const Data = JSON.stringify({ name, version })
  const PartitionKey = `t2c-${Math.floor(Math.random() * 1000)}`
  await kinesis.putRecord({
    Data,
    PartitionKey,
    StreamName
  }).promise()
}

// async function scanAndPublish (data) {
//   const stream = await listener(newPackage)
//   console.log(`Processing NPM registry Stream from ${stream.sequence()}`)
//   await Promise.delay(scanTimeout)
//   console.log(`Quiting after ${scanTimeout / 1000} seconds`)
//   console.log(`Processed NPM registry Stream to ${stream.sequence()}`)
//   stream.end()
// }

// function newPackage (newPackage) {
//   const doc = newPackage.doc
//   const { name, versions } = doc
//   if (!name || typeof versions !== 'object') {
//     return
//   }

//   return snsPublish({
//     type: 'detect',
//     data: { name }
//   })
// }
