/*eslint-disable no-console */
'use strict';

var http = require('http');

var bodyParser = require('body-parser'),
    express = require('express'),
    jsonLines = require('json-lines'),
    processEnv = require('processenv');

var port = processEnv('ZUUL_PORT');

var app = express();

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('foobar');
});

app.post('/', function (req, res) {
  res.send('barfoo');
});

app.get('/with-querystring', function (req, res) {
  res.send(req.query.value);
});

app.post('/with-body', function (req, res) {
  res.send(req.body);
});

app.post('/streaming', jsonLines(function (client) {
  client.once('connect', function () {
    var i;

    for (i = 0; i < 1000; i++) {
      client.send({ counter: i });
    }
    client.disconnect();
  });
}));

http.createServer(app).listen(port, function () {
  console.log('Server running on port ' + port);
});
