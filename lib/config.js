import dotenv from 'dotenv'
dotenv.config()

const {
  scanTimeout: scanTimeoutString,
  packagePrefix,
  settingsPrefix,
  s3Bucket,
  AWS_REGION: region,
  eventTopic,
  concurrency: concurrencyString
} = process.env

const scanTimeout = Number(scanTimeoutString)
const concurrency = Number(concurrencyString)

export {
  scanTimeout,
  packagePrefix,
  settingsPrefix,
  s3Bucket,
  region,
  eventTopic,
  concurrency
}
