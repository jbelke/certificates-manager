/* eslint-disable operator-linebreak */
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
  aliAccessKeyId: process.env.ALI_ACCESS_KEY_ID,
  aliAccessKeySecret: process.env.ALI_ACCESS_KEY_SECRET,
  abtnodeAccessKey: process.env.NODE_ACCESS_KEY,
  abtnodeAccessSecret: process.env.NODE_ACCESS_SECRET,
  abtnodePort: process.env.ABT_NODE_PORT,
};
