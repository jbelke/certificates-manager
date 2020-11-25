const path = require('path');
const createQueue = require('@abtnode/queue');

module.exports = ({ name, dataDir, onJob, options = {} }) => {
  const queue = createQueue({
    file: path.join(dataDir, `${name}.db`),
    onJob,
    options,
  });

  return queue;
};
