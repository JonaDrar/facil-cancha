const healtcheck = (req, res) => {
  res.send('Health Check OK');
};

module.exports = {
  healtcheck,
};