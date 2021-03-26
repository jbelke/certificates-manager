/* eslint-disable func-names */
/* eslint-disable prefer-template */
/* eslint-disable object-shorthand */

const logger = require('../logger');

/* eslint-disable no-var */
require('dotenv').config();

module.exports.create = function (config) {
  const { dnsRecordState, zone } = config;

  if (!dnsRecordState) {
    throw new Error('dnsRecordState is required');
  }

  if (!zone) {
    throw new Error('zone is required');
  }

  return {
    propagationDelay: config.propagationDelay,
    init: function () {
      return Promise.resolve(null);
    },
    zones: function () {
      return [zone];
    },
    set: function (data) {
      var ch = data.challenge;

      if (!ch.dnsZone) {
        throw new Error('no matching zone for ' + ch.dnsHost);
      }

      return dnsRecordState
        .insert({
          domainName: ch.dnsZone,
          rr: ch.dnsPrefix,
          domainAndRecord: `${ch.dnsPrefix}.${ch.dnsZone}`,
          type: 'TXT',
          value: ch.dnsAuthorization,
        })
        .then(() => {
          logger.info('add record success', {
            domainName: ch.dnsZone,
            rr: ch.dnsPrefix,
            domainAndRecord: `${ch.dnsPrefix}.${ch.dnsZone}`,
          });
        })
        .catch((error) => {
          logger.error('add record failed', {
            domainName: ch.dnsZone,
            rr: ch.dnsPrefix,
            domainAndRecord: `${ch.dnsPrefix}.${ch.dnsZone}`,
            error,
          });
        });
    },
    get: function (data) {
      var ch = data.challenge;

      return dnsRecordState
        .findOne({
          rr: ch.dnsPrefix,
          value: ch.dnsAuthorization,
          domainName: ch.dnsZone,
        })
        .then((record) => {
          if (record) {
            logger.info('get dns-01 record', { rr: ch.dnsPrefix, domainName: ch.dnsZone });
            return { dnsAuthorization: record.value };
          }

          logger.info('get dns-01 record not found', { rr: ch.dnsPrefix, domainName: ch.dnsZone });

          return null;
        })
        .catch((error) => {
          logger.error('get dns-01 record failed', {
            domainName: ch.dnsZone,
            error,
          });
        });
    },
    remove: function (data) {
      var ch = data.challenge;

      return dnsRecordState
        .remove({
          rr: ch.dnsPrefix,
          value: ch.dnsAuthorization,
          domainName: ch.dnsZone,
        })
        .then((result) => {
          logger.info('remove dns-01 record', {
            domainName: ch.dnsZone,
            rr: ch.dnsPrefix,
            result,
          });
        })
        .catch((error) => {
          logger.error('remove dns-01 record failed', {
            domainName: ch.dnsZone,
            rr: ch.dnsPrefix,
            error,
          });
        });
    },
  };
};
