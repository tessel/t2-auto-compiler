import got from 'got'
import gunzip from 'gunzip-maybe'
import Promise from 'bluebird'
import retry from 'bluebird-retry'
import tar from 'tar-esnext'
import logger from './logger'
import { parse as parseUrl } from 'url'

const debug = logger('registry')

const retryOptions = {
  interval: 200,
  backoff: 2,
  max_tries: 2,
  throw_original: true
}

export function getLatestVersion (pkgJson) {
  const latest = pkgJson['dist-tags'] && pkgJson['dist-tags'].latest
  if (!latest) {
    throw new Error(`Unable to detect latest version for ${pkgJson.name}`)
  }
  return latest
}

export async function packageJSON (name) {
  if (!name) {
    throw TypeError('"name" is not defined')
  }
  debug(`Getting package info: ${name}`)
  const request = await got(`https://skimdb.npmjs.com/registry/${name}`, {
    headers: { 'user-agent': 't2-auto-compiler (https://github.com/tessel/t2-auto-compiler)' },
    timeout: 500,
    json: true
  })
  return request.body
}

export function tarballUrl (name, version, info) {
  if (!name || !version || !info) {
    throw TypeError(`"name" or "version" or "info" are missing ${name}@${version}`)
  }

  const meta = info.versions[version]
  if (!meta) {
    throw new Error(`Unable to find version for ${name}@${version}`)
  }
  if (!meta.dist.tarball) {
    throw new Error(`Unable to find url for ${name}@${version}`)
  }
  return meta.dist.tarball
}

export function checkForGypFile (url) {
  debug(`Scanning ${url} for binding.gyp`)
  const response = got.stream({
    ...parseUrl(url),
    protocol: 'https:',
    headers: { 'user-agent': 't2-auto-compiler (https://github.com/tessel/t2-auto-compiler)' },
    timeout: 500
  })
  const unzip = gunzip()
  const untar = tar.Parse()

  let clientResponse
  response.on('response', res => {
    clientResponse = res
    debug(`Response ${url}`)
  })
  return new Promise((resolve, reject) => {
    let detected = false
    let finished = false

    function finish () {
      if (finished) { return }
      finished = true
      response.end()

      // this seriously doesn't always exist
      if (clientResponse && clientResponse.destroy) {
        clientResponse.destroy()
      }

      if (!detected) {
        debug(`No binding.gyp found in ${url}`)
      } else {
        debug(`Found binding.gyp in ${url}`)
      }
      resolve(detected)
    }

    function error (e) {
      if (finished) { return }
      finished = true
      reject(e)
    }

    untar.on('entry', (entry) => {
      const file = entry.props.path
      // debug(`Scanning ${url} ${file}`)
      entry.abort()
      if (file.match(/binding\.gyp$/)) {
        detected = true
        finish()
      }
    })

    untar.on('end', finish)
    response.on('error', error)
    unzip.on('error', error)
    untar.on('error', error)

    response.pipe(unzip).pipe(untar)
  })
}

export async function checkPackage (name, version) {
  const pkgJson = await packageJSON(name)
  const url = tarballUrl(name, version, pkgJson)
  return checkForGypFile(url)
}

export function checkForGypFileRetry (url) {
  return retry(() => checkForGypFile(url), retryOptions)
}
