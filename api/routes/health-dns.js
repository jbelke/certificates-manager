const { lookup } = require('dns');
const { promisify } = require('util');

const { parseIP, ipReg } = require('../libs/dns-service');

const lookupSync = promisify(lookup);

module.exports = {
  init(app) {
    app.get('/api/dns/health', async (req, res) => {
      const { domain } = req.query;

      if (!domain) {
        console.error('invalid domain');
        return res.status(400).send('invalid domain');
      }

      if (!ipReg.test(domain)) {
        console.error('invalid domain format');
        return res.status(400).send('invalid domain format');
      }

      try {
        const parsedIP = parseIP(domain);
        const result = await lookupSync(domain);
        if (!result || result.address !== parsedIP) {
          console.error(`resolve error, lookup address: ${JSON.stringify(result)}, parsed ip: ${parsedIP}`);
          return res.status(500).send('internal server error');
        }

        return res.send('ok');
      } catch (error) {
        console.error('lookup dns error:', error);
        return res.status(500).send('internal server error');
      }
    });
  },
};
