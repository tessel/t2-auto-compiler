import Promise from 'bluebird'
import AWS from 'aws-sdk'
import https from 'https'
import { region } from './config'

global.Promise = Promise
AWS.config.setPromisesDependency(Promise)

const agent = new https.Agent({
  maxSockets: 20
})

AWS.config.update({
  region,
  httpOptions: {
    agent
  }
})

export default AWS
