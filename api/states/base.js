const path = require('path');
const fs = require('fs');
const util = require('util');
const DataStore = require('@abtnode/nedb');

if (!process.env.BLOCKLET_DATA_DIR || !fs.existsSync(process.env.BLOCKLET_DATA_DIR)) {
  throw new Error('valid BLOCKLET_DATA_DIR env is required');
}

class Base {
  constructor(name) {
    const _db = new DataStore({
      filename: path.join(process.env.BLOCKLET_DATA_DIR, `${name}.db`),
      autoload: true,
      timestampData: true,
      onload: (err) => {
        if (err) {
          console.error(`failed to load disk database ${this.filename}`, err);
        }
      },
    });

    this.db = new Proxy(_db, {
      get(target, property) {
        return util.promisify(target[property]).bind(target);
      },
    });
  }

  insert(...args) {
    return this.db.insert(...args);
  }

  find(...args) {
    if (args.length === 0) {
      return this.db.find({});
    }

    return this.db.find(...args);
  }

  findOne(...args) {
    if (args.length === 0) {
      return this.db.findOne({});
    }

    return this.db.findOne(...args);
  }

  remove(...args) {
    return this.db.remove(...args);
  }

  async exists(name) {
    const tmp = await this.db.findOne({ name });
    return !!tmp;
  }
}

module.exports = Base;
