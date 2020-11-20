const BaseSate = require('./base');

class DnsService extends BaseSate {
  constructor() {
    super('dns_provider');
  }
}

module.exports = DnsService;
