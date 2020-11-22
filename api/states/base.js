const path = require('path');
const fs = require('fs');
const util = require('util');
const DataStore = require('@abtnode/nedb');

if (!process.env.BLOCKLET_DATA_DIR || !fs.existsSync(process.env.BLOCKLET_DATA_DIR)) {
  throw new Error('valid BLOCKLET_DATA_DIR env is required');
}

class Base {
  constructor(name) {
    this.db = new DataStore({
      filename: path.join(process.env.BLOCKLET_DATA_DIR, `${name}.db`),
      autoload: true,
      timestampData: true,
      onload: (err) => {
        if (err) {
          console.error(`failed to load disk database ${this.filename}`, err);
        }
      },
    });

    this.instance = new Proxy(this.db, {
      get(target, property) {
        return util.promisify(target[property]).bind(target);
      },
    });
  }

  insert(...args) {
    return this.instance.insert(...args);
  }

  find(...args) {
    if (args.length === 0) {
      return this.instance.find({});
    }

    return this.instance.find(...args);
  }

  findOne(...args) {
    if (args.length === 0) {
      return this.instance.findOne({});
    }

    return this.instance.findOne(...args);
  }
}

module.exports = Base;
