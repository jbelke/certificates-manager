const { DOMAIN_STATUS } = require('../libs/constant');
const BaseSate = require('./base');

class Domain extends BaseSate {
  constructor() {
    super('domain');
    this.db.ensureIndex({ fieldName: 'domain', unique: true });
  }

  insert(...args) {
    if (args[0] && typeof args[0].status === 'undefined') {
      args[0].status = DOMAIN_STATUS.added;
    }

    return super.insert(...args);
  }

  async updateStatus(domain, status) {
    if (!Object.values(DOMAIN_STATUS).includes(status)) {
      throw new Error('invalid domain status');
    }

    return this.update({ domain }, { $set: { status } });
  }
}

module.exports = new Domain();
