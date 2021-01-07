module.exports = {
  info: console.log,
  error: console.error,
  debug: (...args) => {
    if (process.env.DEBUG) {
      console.log(...args);
    }
  },
};
