'use strict';

const http = require('http');

const bodyParser = require('body-parser'),
      express = require('express'),
      jsonLines = require('json-lines'),
      processEnv = require('processenv');

const port = processEnv('ZUUL_PORT');

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('foobar');
});

app.post('/', (req, res) => {
  res.send('barfoo');
});

app.get('/with-querystring', (req, res) => {
  res.send(req.query.value);
});

app.post('/with-body', (req, res) => {
  res.send(req.body);
});

app.post('/streaming', jsonLines(client => {
  client.once('connect', () => {
    for (let i = 0; i < 1000; i++) {
      client.send({ counter: i });
    }
    client.disconnect();
  });
}));

http.createServer(app).listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Server running on port ${port}`);
  /* eslint-enable no-console */
});
