const Base = require('./base');

class DomainState extends Base {
  constructor() {
    super('dns-record');
  }
}

module.exports = new DomainState();
