require('dotenv').config()

const Promise = require('bluebird')
const async = require('rollup-plugin-async')
const buble = require('rollup-plugin-buble')
const fs = Promise.promisifyAll(require('fs-extra'))
const minimatch = require('minimatch')
const { dependencies } = require('../package')
const { join } = require('path')
const { rollup } = require('rollup')

const debug = require('debug')('t2c:build')

const external = [
  ...Object.keys(dependencies),
  'https'
]

const pattern = process.env.PATTERN || '*'

function build (entry, dest) {
  return rollup({
    entry,
    external,
    plugins: [
      async(),
      buble({
        transforms: {
          arrow: false,
          generator: false,
          templateString: false
        }
      })
    ]
  }).then(bundle => bundle.write({
    format: 'cjs',
    sourceMap: false,
    dest
  })).then(() => {
    debug(`Wrote ${dest}`)
  })
}

function copyNodeModules (name) {
  const dest = `dist/${name}/node_modules`
  debug('linking node modules into', dest)
  return fs.ensureLinkAsync('./node_modules', dest)
}

const compile = fs.readdirSync('functions')
  .filter(minimatch.filter(pattern))
  .map(name => {
    const entry = join('functions', name, 'index.js')
    const dest = join('dist', name, 'index.js')
    return Promise.all([
      build(entry, dest),
      copyNodeModules(name)
    ])
  })

compile.push(build('lib/scan-registry.js', 'dist/scan-registry.js'))

Promise.all(compile).then(() => {
  console.log('Compile complete')
}, (e) => {
  console.error(`Compile failed: ${e.message}\n${e.plugin}:${e.id}\n${e.stack}`)
})
