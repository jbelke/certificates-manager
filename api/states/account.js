const BaseSate = require('./base');

class Account extends BaseSate {
  constructor() {
    super('account');
  }
}

module.exports = new Account();
