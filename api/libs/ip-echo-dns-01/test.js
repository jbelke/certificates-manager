#!/usr/bin/env node
/* eslint-disable */

'use strict';

// See https://git.coolaj86.com/coolaj86/acme-challenge-test.js
var tester = require('acme-challenge-test');
require('dotenv').config();

const dnsRecordState = require('../../states/dns-record');

// Usage: node ./test.js example.com token account
var zone = process.env.ECHO_DNS_DOMAIN;
var challenger = require('./index.js').create({ dnsRecordState, zone });

// The dry-run tests can pass on, literally, 'example.com'
// but the integration tests require that you have control over the domain
tester
  .testZone('dns-01', zone, challenger)
  .then(function () {
    console.info('PASS', zone);
  })
  .catch(function (e) {
    console.error(e.message);
    console.error(e.stack);
  });
