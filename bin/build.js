require('dotenv').config()

const Promise = require('bluebird')
const async = require('rollup-plugin-async')
const buble = require('rollup-plugin-buble')
const Debug = require('debug')
const execa = require('execa')
const fs = Promise.promisifyAll(require('fs-extra'))
const minimatch = require('minimatch')
const { join } = require('path')
const { rollup } = require('rollup')
const { dependencies } = require('../package')

const debug = Debug('t2c:build')

const external = [
  ...Object.keys(dependencies),
  'https'
]

const pattern = process.env.PATTERN || '*'

function build (entry, dest) {
  debug(`Building ${dest}`)
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

function setupNodeModules (name) {
  const dest = `dist/${name}/`
  const logger = Debug(`t2c:build:${name}`)
  logger(`Installing production node modules into ${dest}`)
  return Promise.all([
    fs.copyAsync('./package.json', join(dest, 'package.json')),
    fs.copyAsync('./yarn.lock', join(dest, 'yarn.lock'))
  ]).then(() => execa.shell('yarn install --prod', { cwd: dest }))
    .then(() => logger('done'))
}

const compile = fs.readdirSync('functions')
  .filter(minimatch.filter(pattern))
  .map(name => {
    const entry = join('functions', name, 'index.js')
    const dest = join('dist', name, 'index.js')
    return Promise.all([
      build(entry, dest),
      setupNodeModules(name)
    ])
  })

compile.push(build('lib/scan-registry.js', 'dist/scan-registry.js'))

Promise.all(compile).then(() => {
  console.log('Compile complete')
}, (e) => {
  console.error(`Compile failed: ${e.message}\n${e.plugin}:${e.id}\n${e.stack}`)
})
