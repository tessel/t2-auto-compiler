import Promise from 'bluebird'
import AWS from 'aws-sdk'
import retry from 'bluebird-retry'
import https from 'https'
// const debug = require('debug')('t2:db');

AWS.config.setPromisesDependency(Promise)

const agent = new https.Agent({
  maxSockets: 20
})

AWS.config.update({
  region: 'us-east-1',
  httpOptions: {
    agent
  }
})

const retryOptions = {
  interval: 100,
  backoff: 2,
  timeout: 60000,
  max_tries: Infinity,
  throw_original: true,
  predicate: err => err.retryable
}

const packages = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  params: {
    TableName: 't2-compiler-packages-production'
  }
})

module.exports = {
  packages: {
    table: packages,
    putItem (item) {
      return retry(() => packages.putItem(item).promise(), retryOptions)
    }
  }
}
