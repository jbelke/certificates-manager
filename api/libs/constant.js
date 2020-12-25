module.exports = Object.freeze({
  DOMAIN_STATUS: {
    added: 'added',
    creating: 'creating',
    generated: 'generated',
    renewaling: 'renewaling',
    error: 'error',
  },
  DNS_PORT: Number(process.env.BLOCKLET_DNS_PORT) || 5533,
});
