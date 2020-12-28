const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const DataStore = require('@nedb/core');

if (!process.env.BLOCKLET_DATA_DIR) {
  throw new Error('valid BLOCKLET_DATA_DIR env is required');
}

if (!fs.existsSync(process.env.BLOCKLET_DATA_DIR)) {
  fs.mkdirSync(process.env.BLOCKLET_DATA_DIR);
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
        if (typeof target[property] === 'function') {
          return promisify((...args) => {
            const cb = args[args.length - 1];
            const rest = args.slice(0, args.length - 1);

            target[property](...rest, (err, ...result) => {
              if (err) {
                return err;
              }

              if (result.length === 1) {
                return cb(err, result[0]);
              }

              return cb(err, result);
            });
          }).bind(target);
        }

        return target[property];
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

  async exists(...args) {
    const tmp = await this.db.findOne(...args);
    return !!tmp;
  }

  async update(...args) {
    return this.db.update(...args);
  }
}

/**
 * Rename _id field name to id, this method has side effects
 * @param {object} entities
 */
Base.renameIdFiledName = (entities, from = '_id', to = 'id') => {
  /* eslint-disable  no-underscore-dangle, no-param-reassign */

  if (!entities) {
    return entities;
  }

  const mapEntity = (entity) => {
    if (entity[from]) {
      entity[to] = entity[from];
      delete entity[from];
    }
  };

  if (!Array.isArray(entities)) {
    mapEntity(entities);
    return entities;
  }

  entities.forEach(mapEntity);

  return entities;
};

module.exports = Base;
