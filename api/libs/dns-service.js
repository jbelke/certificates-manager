const dns = require('dns2');

const { echoDnsIpRegex } = require('./env');
const { DNS_PORT } = require('./constant');
const dnsRecordState = require('../states/dns-record');
const logger = require('./logger');

const { Packet } = dns;

const ipReg = new RegExp(echoDnsIpRegex);

const parseIP = (name = '') => {
  if (ipReg.test(name)) {
    const result = ipReg.exec(name);

    return result.slice(1, 5).join('.');
  }

  return '';
};

const server = dns.createServer(async (request, send) => {
  const response = Packet.createResponseFromRequest(request);
  try {
    const [question] = request.questions;
    const { name = '' } = question;

    if (!name) {
      return send(response);
    }

    // FIXME: 需要添加一个 DEBUG 开关
    logger.info('query name', { name });

    if (ipReg.test(name)) {
      response.answers.push({
        name,
        type: Packet.TYPE.A,
        class: Packet.CLASS.IN,
        ttl: 604800, // 7 weeks
        address: parseIP(name),
      });
    } else {
      const records = await dnsRecordState.find({ domainAndRecord: new RegExp(name, 'i') });
      // FIXME: 需要添加一个 DEBUG 开关
      logger.info('records', { name, records: records.map((x) => x.value).join(',') });

      records.forEach((record) => {
        response.answers.push({
          name,
          type: Packet.TYPE.TXT,
          class: Packet.CLASS.IN,
          ttl: 300,
          data: record.value,
        });
      });
    }

    send(response);
  } catch (error) {
    logger.error('resolve dns error', { error, questions: request.questions });
    send(response);
  }
});

const start = () => {
  server.listen(DNS_PORT).then(() => {
    console.log(`> DNS server started at port ${DNS_PORT} successfully`);
  });

  server.on('error', (err) => {
    console.error(`DNS server error:\n${err.stack}`);
    server.close();
  });
};

module.exports = { start, parseIP, ipReg };
