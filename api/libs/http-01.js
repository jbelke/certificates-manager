/**
 * base on: https://www.npmjs.com/package/acme-http-01-standalone
 */

const _memdb = {};

const create = (config = {}) => {
  const memdb = config.cache || _memdb;

  return {
    init() {
      return Promise.resolve(null);
    },

    set(data) {
      return Promise.resolve().then(() => {
        const ch = data.challenge;
        const key = ch.token;
        memdb[key] = ch.keyAuthorization;
        console.log('set key:', key);

        return null;
      });
    },

    get(data) {
      return Promise.resolve().then(() => {
        const ch = data.challenge;
        const key = ch.token;
        console.log('get key', key);

        if (memdb[key]) {
          return { keyAuthorization: memdb[key] };
        }

        return null;
      });
    },

    remove(data) {
      return Promise.resolve().then(() => {
        const ch = data.challenge;
        const key = ch.token;
        console.log('remove key', key);

        delete memdb[key];
        return null;
      });
    },
  };
};

module.exports = {
  create,
  db: _memdb,
};
