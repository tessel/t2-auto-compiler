import { packages } from './db'
import { checkForGypFileRetry } from './registry'

export async function savePackageInfo ({ name, version, url }) {
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
