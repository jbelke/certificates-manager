const { lookup } = require('dns');
const { promisify } = require('util');

const getDomainDnsStatus = async (domain) => {
  if (!domain) {
    throw new Error('domain param is required');
  }

  const data = { domain, resolved: false };
  try {
    const address = await promisify(lookup)(domain);
    data.resolved = true;
    data.ip = address;
  } catch (error) {
    console.error('get domain dns status error', 'domain:', domain, error);
  }

  return data;
};

const getDomainsDnsStatus = async (domains) => {
  const tasks = (domains || []).map((domain) => getDomainDnsStatus(domain));

  const result = await Promise.all(tasks);
  return result;
};

module.exports = { getDomainsDnsStatus };
