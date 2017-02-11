import Promise from 'bluebird'
import { listener } from '../../lib/listener'
import { packages } from '../../lib/db'
import { tarballUrl, checkForGypFileRetry } from '../../lib/registry'

// export function published (event) {
//   console.log(`Analyzing ${event.data.name}@${event.data.version}`)
//   packages.get(event.data.name, event.data.version).then(info => {
//     if (info && typeof info.gypFile === 'boolean') {
//       console.log(`${info.name}@${info.version} has a gypFile value of ${info.gypFile}`)
//       return
//     }
//   })
// }

function saveInformation (doc) {
  const versions = Object.keys(doc.versions)

  return Promise.map(versions, async version => {
    const url = tarballUrl(doc, version)
    const { name } = doc
    let gypFile
    try {
      gypFile = await checkForGypFileRetry(url)
    } catch (e) {
      console.error('Error checking', name)
      console.error(e)
      return
    }
    const data = {
      name,
      version,
      gypFile,
      url
    }

    return Promise.all([
      packages.set(`all/${name}/${name}@${version}`, data),
      packages.set(`all/${name}/${version}`, data),
      gypFile && packages.set(`gypFile/${name}@${version}`, data),
      gypFile && packages.set(`gypFile/${name}/${name}@${version}`, data)
    ])
  })
}

function newPackage (newPackage) {
  const doc = newPackage.doc
  if (!doc.name || typeof doc.versions !== 'object') {
    return
  }
  return saveInformation(doc)
}

const listen = () => listener(newPackage).catch(e => {
  console.error('Error!')
  console.error(e)
  process.exit(1)
})

export default listen
