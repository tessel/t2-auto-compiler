import Promise from 'bluebird'
import AWS from 'aws-sdk'
import https from 'https'
import Debug from 'debug'

// const debug = Debug('t2:db')

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

export default AWS
