# t2-auto-compiler
[![Code of Conduct](https://img.shields.io/badge/%E2%9D%A4-code%20of%20conduct-blue.svg?style=flat)](https://github.com/tessel/project/blob/master/CONDUCT.md)
[![Travis Build Status](https://travis-ci.org/tessel/t2-auto-compiler.svg?branch=master)](https://travis-ci.org/tessel/t2-auto-compiler)

An auto cross compiler for npm packages that use [t2-compiler](https://github.com/tessel/t2-compiler)

## Building Packages

- `yarn build` to build

## Server Infrastructure

- Auth is handled by aws roles and groups, human operators deploying need to be in the `t2-auto-compiler` group
- SNS Topic `t2-auto-compiler-events` gets sns json messages with one guaranteed key `{type}`
- Cloudwatch Rule `t2-compiler-schedule` set to send `{"type": "timer", "period": 600}` every 5 minutes
