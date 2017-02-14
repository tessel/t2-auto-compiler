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

const debug = prefix => Debug(`t2c:build:${prefix}`)

const external = [
  ...Object.keys(dependencies),
  'https'
]

const pattern = process.env.PATTERN || '*'

function build (entry, dest) {
  const log = debug(`rollup ${entry}`)
  log('starting')
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
    log(`Wrote ${dest}`)
  })
}

function setupNodeModules (name) {
  const dest = `dist/${name}/`
  const log = debug(`yarn ${name}`)
  log(`Installing production node modules into ${dest}`)
  return Promise.all([
    fs.copyAsync('./package.json', join(dest, 'package.json')),
    fs.copyAsync('./yarn.lock', join(dest, 'yarn.lock'))
  ]).then(() => execa.shell('yarn install --prod', { cwd: dest }))
    .then(() => log('done'))
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

compile.push(build('lib/scan-and-save.js', 'dist/scan-and-save.js'))
compile.push(build('lib/scan-and-publish.js', 'dist/scan-and-publish.js'))

Promise.all(compile).then(() => {
  console.log('Compile complete')
}, (e) => {
  console.error(`Compile failed: ${e.message}\n${e.plugin}:${e.id}\n${e.stack}`)
})
