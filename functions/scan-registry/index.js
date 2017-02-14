import Promise from 'bluebird'
import { listener } from '../../lib/listener'
import { savePackageInfo } from '../../lib/pkgs'
import { tarballUrl } from '../../lib/registry'

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

const listen = () => listener(newPackage).catch(e => {
  console.error('Error!')
  console.error(e)
  process.exit(1)
})

export default listen
