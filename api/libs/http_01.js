/**
 * from: https://www.npmjs.com/package/acme-http-01-standalone
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
        const key = `${ch.identifier.value}#${ch.token}`;
        memdb[key] = ch.keyAuthorization;

        return null;
      });
    },

    get(data) {
      return Promise.resolve().then(() => {
        // console.log('List Key Auth URL', data);

        const ch = data.challenge;
        const key = `${ch.identifier.value}#${ch.token}`;

        if (memdb[key]) {
          return { keyAuthorization: memdb[key] };
        }

        return null;
      });
    },

    remove(data) {
      return Promise.resolve().then(() => {
        // console.log('Remove Key Auth URL', data);

        const ch = data.challenge;
        const key = `${ch.identifier.value}#${ch.token}`;

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
