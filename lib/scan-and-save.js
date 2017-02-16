import { listener } from './listener'
import { savePackageInfo } from './pkgs'

function newPackage (newPackage) {
  const doc = newPackage.doc
  const { name, versions } = doc
  if (!name || typeof versions !== 'object') {
    return
  }
  return savePackageInfo({ name })
}

const listen = () => listener(newPackage).catch(err => {
  console.error('Error!')
  console.error(err)
  process.exit(1)
})

export default listen
