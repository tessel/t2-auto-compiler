import Promise from 'bluebird'
import { listener } from './listener'
import { publish as snsPublish } from './sns'
import { tarballUrl } from './registry'

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

const listen = () => listener(newPackage).catch(err => {
  console.error('Error!')
  console.error(err)
  process.exit(1)
})

export default listen
