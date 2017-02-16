import AWS from './aws'
import { packagePrefix, settingsPrefix, s3Bucket } from './config'
import logger from './logger'

const debug = logger('db')

const s3 = new AWS.S3({ apiVersion: '2006-03-01' })

export class Table {
  constructor (bucket, keyPrefix) {
    this.bucket = bucket
    this.keyPrefix = keyPrefix
  }

  async set (key, item) {
    if (!item) {
      return
    }
    const storageKey = `${this.keyPrefix}/${key}.json`
    debug('set', storageKey)
    await s3.putObject({
      Bucket: this.bucket,
      Key: storageKey,
      Body: JSON.stringify(item)
    }).promise()
  }

  async exists (key) {
    const storageKey = `${this.keyPrefix}/${key}.json`
    return s3.headObject({
      Bucket: this.bucket,
      Key: storageKey
    }).promise().then(() => {
      debug('exists', true, storageKey)
      return true
    }).catch({ code: 'NotFound' }, () => {
      debug('exists', false, storageKey)
      return false
    })
  }

  async get (key) {
    const storageKey = `${this.keyPrefix}/${key}.json`
    debug('get', storageKey)
    const { Body } = await s3.getObject({
      Bucket: this.bucket,
      Key: storageKey
    }).promise()
    return JSON.parse(Body)
  }
}

export const packages = new Table(s3Bucket, packagePrefix)
export const settings = new Table(s3Bucket, settingsPrefix)
