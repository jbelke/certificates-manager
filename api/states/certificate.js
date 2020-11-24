const BaseSate = require('./base');

class Certificate extends BaseSate {
  constructor() {
    super('certificate');
  }
}

module.exports = new Certificate();
