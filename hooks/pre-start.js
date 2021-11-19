/* eslint-disable */
require('@blocklet/sdk/lib/error-handler');
const Client = require('@abtnode/client');

console.log('#################################');
console.log('### This is pre start hook ###');
console.log('#################################');

const accessKeyId = process.env.NODE_ACCESS_KEY;
const accessKeySecret = process.env.NODE_ACCESS_SECRET;

try {
  Client.validateAccessKey({ accessKeyId, accessKeySecret })
} catch (error) {
  console.error('NODE_ACCESS_KEY and NODE_ACCESS_SECRET does not match')
  process.exit(1);
}