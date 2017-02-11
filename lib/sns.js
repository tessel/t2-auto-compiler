import AWS from './aws'
import { eventTopic } from './config'
import logger from './logger'

const debug = logger('sns')

const sns = new AWS.SNS({
  apiVersion: '2010-03-31'
})

export function publish (event = {}) {
  debug('publish', event)
  if (!event.type) {
    throw new TypeError('"event.type" is a required field')
  }
  return sns.publish({
    TopicArn: eventTopic,
    Message: JSON.stringify(event)
  }).promise()
}
