/* eslint-disable func-names */
/* eslint-disable prefer-template */
/* eslint-disable object-shorthand */
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
        throw new Error('No matching zone for ' + ch.dnsHost);
      }

      return dnsRecordState
        .insert({ domainName: ch.dnsZone, rr: ch.dnsPrefix, type: 'TXT', value: ch.dnsAuthorization })
        .then(() => true)
        .catch(console.error);
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
            return { dnsAuthorization: record.value };
          }

          return null;
        })
        .catch(console.error);
    },
    remove: function (data) {
      var ch = data.challenge;

      return dnsRecordState
        .remove({
          rr: ch.dnsPrefix,
          value: ch.dnsAuthorization,
          domainName: ch.dnsZone,
        })
        .then((record) => record === 1)
        .catch(console.error);
    },
  };
};
