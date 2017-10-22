import Promise from 'bluebird'
import { isBinaryPackage } from '../../lib/registry'
import { buildPackage } from '../../lib/ecs'

export function handler (event, context, callback) {
  asyncHandler(event, context).then(data => callback(null, data), callback)
}

// Read Kinesis events
async function asyncHandler ({ Records }, context) {
  const data = Records.map(record => JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString('utf8')))

  await Promise.map(data, async pkg => {
    if (await isBinaryPackage(pkg)) {
      await buildPackage(pkg)
      console.log(`Built package: ${pkg.name}@${pkg.version}`)
    } else {
      console.log(`Skipping package: ${pkg.name}@${pkg.version}`)
    }
  })
}
