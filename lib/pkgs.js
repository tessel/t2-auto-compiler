import logger from './logger'
import { checkForGypFileRetry } from './registry'
import { packages } from './db'

const debug = logger('savePackageInfo')

export async function savePackageInfo ({ name, version, url }) {
  debug(`saving info for ${name}@${version}`)
  let gypFile
  try {
    gypFile = await checkForGypFileRetry(url)
  } catch (error) {
    console.error('Error checking', name)
    console.error(error)
    return packages.set(`error/${name}@${version}`, { error })
  }

  const data = {
    name,
    version,
    url,
    gypFile
  }

  if (gypFile) {
    return packages.set(`gypFile/${name}@${version}`, data)
  }
  // else {
  //   return packages.set(`noGypFile/${name}@${version}`, data)
  // }
}
