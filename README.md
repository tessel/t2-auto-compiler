# t2-auto-compiler
[![Code of Conduct](https://img.shields.io/badge/%E2%9D%A4-code%20of%20conduct-blue.svg?style=flat)](https://github.com/tessel/project/blob/master/CONDUCT.md)
[![Travis Build Status](https://travis-ci.org/tessel/t2-auto-compiler.svg?branch=master)](https://travis-ci.org/tessel/t2-auto-compiler)

An auto cross compiler for npm packages that use [t2-compiler](https://github.com/tessel/t2-compiler)

## Building Packages

- `yarn build` to build

## Server Infrastructure

- Auth is handled by aws roles and groups, human operators deploying need to be in the `t2-auto-compiler` group
- ECS Fargate published `t2-compiler-docker` image that builds and uploads packages to s3
- Cloudwatch Rule `t2-compiler-schedule` set to send `{"type": "timer", "period": 600}` every 5 minutes which triggers `t2-compiler-listener`
- Lambda Function `t2-compiler-listener` which publishes new package events to Kinesis
- Kinesis Stream `t2-compiler-packages` which has package names and versions published to it
- The function `t2-compiler-builder` which listens for Kinesis events and uses the `t2-compiler-docker` to build and upload files
