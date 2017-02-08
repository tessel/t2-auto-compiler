const async = require('rollup-plugin-async')
const buble = require('rollup-plugin-buble')
const nodeResolve = require('rollup-plugin-node-resolve')
const fs = require('fs')
const minimatch = require('minimatch')
const { join } = require('path')
const { rollup } = require('rollup')
const { dependencies } = require('./package')

const external = [
  'aws-sdk'
]
const pattern = process.env.PATTERN || '*'

const compile = fs.readdirSync('functions')
  .filter(minimatch.filter(pattern))
  .map(name => {
    const dest = join('dist', name, 'index.js')
    return rollup({
      entry: join('functions', name, 'index.js'),
      external,
      plugins: [
        async(),
        buble({
          transforms: { forOf: false }
        }),
        nodeResolve({
          // module: false,
          extensions: ['.js', '.json']
        })
      ]
    }).then(bundle => {
      return bundle.write({
        format: 'cjs',
        dest
      })
    }).then(() => {
      console.log(`Wrote ${dest}`)
    })
  })

Promise.all(compile).then(() => {
  console.log("Compile complete")
}, (e) => {
  console.log(`Compile failed: ${e.message}\n${e.plugin}:${e.id}\n${e.stack}`)
})
