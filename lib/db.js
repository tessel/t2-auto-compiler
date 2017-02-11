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
    await s3.putObject({
      Bucket: this.bucket,
      Key: `${this.keyPrefix}/${key}.json`,
      Body: JSON.stringify(item)
    }).promise()
    debug('set', `${this.bucket}/${key}`)
  }

  async get (key) {
    const realKey = `${this.keyPrefix}/${key}.json`
    debug('get', realKey)
    const { Body } = await s3.getObject({
      Bucket: this.bucket,
      Key: realKey
    }).promise()
    return JSON.parse(Body)
  }
}

export const packages = new Table(s3Bucket, packagePrefix)
export const settings = new Table(s3Bucket, settingsPrefix)
