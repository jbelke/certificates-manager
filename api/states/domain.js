const BaseSate = require('./base');

class Domain extends BaseSate {
  constructor() {
    super('domain');
    this.db.ensureIndex({ fieldName: 'domain', unique: true });
  }
}

module.exports = new Domain();
