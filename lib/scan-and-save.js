import Promise from 'bluebird'
import { listener } from './listener'
import { savePackageInfo } from './pkgs'
import { tarballUrl } from './registry'

function newPackage (newPackage) {
  const doc = newPackage.doc
  const { name, versions } = doc
  if (!name || typeof versions !== 'object') {
    return
  }

  return Promise.map(Object.keys(versions), async version => {
    const url = await tarballUrl(name, version, doc)
    return savePackageInfo({ name, version, url })
  })
}

const listen = () => listener(newPackage).catch(err => {
  console.error('Error!')
  console.error(err)
  process.exit(1)
})

export default listen
