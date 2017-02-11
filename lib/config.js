import dotenv from 'dotenv'
dotenv.config()

const {
  scanTimeout,
  packagePrefix,
  settingsPrefix,
  s3Bucket,
  AWS_REGION: region,
  AWS_ACCESS_KEY_ID: accessKeyId,
  AWS_SECRET_ACCESS_KEY: secretAccessKey,
  eventTopic,
  concurrency
} = process.env

export {
  scanTimeout,
  packagePrefix,
  settingsPrefix,
  s3Bucket,
  region,
  accessKeyId,
  secretAccessKey,
  eventTopic,
  concurrency
}
