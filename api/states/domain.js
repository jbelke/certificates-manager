const path = require('path');
const fs = require('fs');
const util = require('util');
const DataStore = require('@abtnode/nedb');

if (!fs.existsSync(process.env.BLOCKLET_DATA_DIR)) {
  throw new Error('valid BLOCKLET_DATA_DIR env is required');
}

const db = new DataStore({
  filename: path.join(process.env.BLOCKLET_DATA_DIR, 'domain.db'),
  autoload: true,
  timestampData: true,
  onload: (err) => {
    if (err) {
      console.error(`failed to load disk database ${this.filename}`, err);
    }
  },
});

const promisedDBInstance = new Proxy(db, {
  get(target, property) {
    return util.promisify(target[property]).bind(target);
  },
});

const removeByName = (name) => {
  console.log('remove creation state');
  return promisedDBInstance.remove({ name });
};

const create = (entity) => {
  console.log('create chain creation state');
  return promisedDBInstance.insert(entity);
};

const isExists = async (name) => {
  const tmp = await promisedDBInstance.findOne({ name });
  return !!tmp;
};

const find = (...args) => {
  if (args.length === 0) {
    return promisedDBInstance.find({});
  }

  return promisedDBInstance.find(...args);
};

module.exports = {
  find,
  create,
  isExists,
  removeByName,
  findOne: promisedDBInstance.findOne,
  update: promisedDBInstance.update,
};
