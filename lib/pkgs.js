import logger from './logger'
import { packages } from './db'
import { tarballUrl, packageJSON, checkForGypFileRetry } from './registry'

const debug = logger('savePackageInfo')

export async function savePackageVersionInfo ({ name, version, url }) {
  debug(`saving info for ${name}@${version}`)

  if (await packages.exists(`gypFile/${name}@${version}`)) {
    return
  }

  let gypfile
  try {
    gypfile = await checkForGypFileRetry(url)
  } catch (error) {
    console.error('Error checking', name)
    console.error(error)
    return packages.set(`error/${name}@${version}`, { error })
  }

  const data = {
    name,
    version,
    url,
    gypfile
  }

  if (gypfile) {
    return packages.set(`gypFile/${name}@${version}`, data)
  }
}

export async function savePackageInfo ({ name }) {
  if (!name) {
    throw TypeError(`"name" is not a package name got: ${name}`)
  }
  const info = await packageJSON(name)
  if (!info || !info.versions) {
    throw TypeError(`"info.versions" for ${name} is not present`)
  }
  return Promise.map(Object.keys(info.versions), async (version) => {
    const url = tarballUrl(name, version, info)
    return savePackageVersionInfo({ name, version, url })
  })
}
