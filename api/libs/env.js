/* eslint-disable operator-linebreak */

const notExistEnvs = ['NODE_ACCESS_KEY', 'NODE_ACCESS_SECRET', 'NODE_DOMAIN', 'MAINTAINER_EMAIL'].filter(
  (x) => !process.env[x]
);
if (notExistEnvs.length) {
  throw new Error(`${notExistEnvs.join(', ')} are required`);
}

module.exports = {
  appId:
    process.env.BLOCKLET_APP_ID ||
    process.env.REACT_APP_APP_ID ||
    process.env.GATSBY_APP_ID ||
    process.env.APP_ID ||
    process.env.appId ||
    '',
  appName:
    process.env.REACT_APP_APP_NAME ||
    process.env.GATSBY_APP_NAME ||
    process.env.APP_NAME ||
    process.env.appName ||
    'Certificates Manager',
  appDescription:
    process.env.REACT_APP_APP_DESCRIPTION ||
    process.env.GATSBY_APP_DESCRIPTION ||
    process.env.APP_DESCRIPTION ||
    process.env.appDescription ||
    'Manage SSL certificates',
  baseUrl:
    process.env.REACT_APP_BASE_URL || process.env.GATSBY_BASE_URL || process.env.BASE_URL || process.env.baseUrl || '',
  apiPrefix:
    process.env.REACT_APP_API_PREFIX ||
    process.env.GATSBY_API_PREFIX ||
    process.env.NF_API_PREFIX ||
    process.env.API_PREFIX ||
    process.env.apiPrefix ||
    '',
  abtnodeAccessKey: process.env.NODE_ACCESS_KEY,
  abtnodeAccessSecret: process.env.NODE_ACCESS_SECRET,
  abtnodePort: process.env.ABT_NODE_PORT,
  nodeDomain: process.env.NODE_DOMAIN,
  maintainerEmail: process.env.MAINTAINER_EMAIL,
  echoDnsIpRegex: process.env.ECHO_DNS_IP_REGEX,
  echoDnsDomain: process.env.ECHO_DNS_DOMAIN,
  daysBeforeExpireToRenewal: process.env.DAYS_BEFORE_EXPIRE_TO_RENEWAL,
};
