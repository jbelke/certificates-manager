const BaseSate = require('./base');

class Domain extends BaseSate {
  constructor() {
    super('domain');
  }

  async isExists(name) {
    const tmp = await this.instans.findOne({ name });
    return !!tmp;
  }
}

module.exports = Domain;
