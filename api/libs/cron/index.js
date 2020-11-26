const CronScheduler = require('./scheduler');

function init(context = {}, jobs = []) {
  const cron = new CronScheduler(context);

  if (Array.isArray(jobs)) {
    jobs.forEach((x) => {
      if (x.name && x.time && typeof x.fn === 'function') {
        try {
          cron.addJob(x.name, x.time, x.fn, x.options || {});
          console.info('job added to scheduler', x);
        } catch (err) {
          console.info('failed to add job to scheduler', { error: err, name: x.name });
        }
      } else {
        console.error('invalid job for scheduler', x);
      }
    });
  }
}

module.exports = { init };
