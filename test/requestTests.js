'use strict';

var url = require('url');

var assert = require('assertthat');

var https = require('../https');
var http = require('../http');

var getLocationOrigin = function () {
  if (!location.origin) {
    location.origin = location.protocol + '//' + location.hostname + (location.port ? (':' + location.port) : '');
  }
  return location.origin;
};

var serverUrl = getLocationOrigin();
var server = url.parse(serverUrl);

suite('request', function () {
  this.timeout(10 * 1000);

  suite('http', function () {
    test('has status codes', function (done) {
      assert.that(http.STATUS_CODES[200]).is.equalTo('OK');
      done();
    });
  });

  suite('https', function () {
    test('is an object.', function (done) {
      assert.that(https).is.ofType('object');
      done();
    });

    suite('get', function () {
      test('is a function.', function (done) {
        assert.that(https.get).is.ofType('function');
        done();
      });

      test('throws an error if options are missing.', function (done) {
        assert.that(function () {
          https.get();
        }).is.throwing('Options are missing.');
        done();
      });

      suite('gets the content of a website', function () {
        test('by its url.', function (done) {
          https.get(serverUrl + '/', function (res) {
            var content = '';

            assert.that(res.statusCode).is.equalTo(200);

            res.on('data', function (data) {
              content += data.toString('utf8');
            });

            res.once('end', function () {
              assert.that(content).is.equalTo('foobar');
              res.removeAllListeners();
              done();
            });
          });
        });

        test('by an options object.', function (done) {
          https.get({
            hostname: server.hostname,
            port: server.port,
            path: '/'
          }, function (res) {
            var content = '';

            assert.that(res.statusCode).is.equalTo(200);

            res.on('data', function (data) {
              content += data.toString('utf8');
            });

            res.once('end', function () {
              assert.that(content).is.equalTo('foobar');
              res.removeAllListeners();
              done();
            });
          });
        });
      });
    });

    suite('request', function () {
      test('is a function.', function (done) {
        assert.that(https.request).is.ofType('function');
        done();
      });

      test('throws an error if options are missing.', function (done) {
        assert.that(function () {
          https.request();
        }).is.throwing('Options are missing.');
        done();
      });

      suite('gets the content of a website', function () {
        test('by its url.', function (done) {
          var req;

          req = https.request(serverUrl + '/', function (res) {
            var content = '';

            assert.that(res.statusCode).is.equalTo(200);

            res.on('data', function (data) {
              content += data.toString('utf8');
            });

            res.once('end', function () {
              assert.that(content).is.equalTo('foobar');
              res.removeAllListeners();
              done();
            });
          });
          req.end();
        });

        test('by an options object.', function (done) {
          var req;

          req = https.request({
            method: 'GET',
            hostname: server.hostname,
            port: server.port,
            path: '/'
          }, function (res) {
            var content = '';

            assert.that(res.statusCode).is.equalTo(200);

            res.on('data', function (data) {
              content += data.toString('utf8');
            });

            res.once('end', function () {
              assert.that(content).is.equalTo('foobar');
              res.removeAllListeners();
              done();
            });
          });
          req.end();
        });
      });
    });

    test('supports POST.', function (done) {
      var req;

      req = https.request({
        method: 'POST',
        hostname: server.hostname,
        port: server.port,
        path: '/'
      }, function (res) {
        var content = '';

        assert.that(res.statusCode).is.equalTo(200);

        res.on('data', function (data) {
          content += data.toString('utf8');
        });

        res.once('end', function () {
          assert.that(content).is.equalTo('barfoo');
          res.removeAllListeners();
          done();
        });
      });
      req.end();
    });

    test('supports sending data.', function (done) {
      var req;

      req = https.request({
        method: 'POST',
        hostname: server.hostname,
        port: server.port,
        path: '/with-body',
        headers: {
          'content-type': 'application/json'
        }
      }, function (res) {
        var content = '';

        assert.that(res.statusCode).is.equalTo(200);

        res.on('data', function (data) {
          content += data.toString('utf8');
        });

        res.once('end', function () {
          assert.that(content).is.equalTo(JSON.stringify({ foo: 'bar' }));
          res.removeAllListeners();
          done();
        });
      });
      req.write(JSON.stringify({ foo: 'bar' }));
      req.end();
    });

    test('handles query strings.', function (done) {
      var req;

      req = https.request({
        method: 'GET',
        hostname: server.hostname,
        port: server.port,
        path: '/with-querystring?value=82517'
      }, function (res) {
        var content = '';

        assert.that(res.statusCode).is.equalTo(200);

        res.on('data', function (data) {
          content += data.toString('utf8');
        });

        res.once('end', function () {
          assert.that(content).is.equalTo('82517');
          res.removeAllListeners();
          done();
        });
      });
      req.end();
    });

    test('supports streaming.', function (done) {
      var req;

      req = https.request({
        method: 'POST',
        hostname: server.hostname,
        port: server.port,
        path: '/streaming'
      }, function (res) {
        var content = '';
        var dataCounter = 0;

        assert.that(res.statusCode).is.equalTo(200);

        res.on('data', function (data) {
          content += data.toString('utf8');
          dataCounter++;
        });

        res.once('end', function () {
          assert.that(content.indexOf(JSON.stringify({ counter: 0 }) + '\n')).is.not.equalTo(-1);
          assert.that(content.indexOf(JSON.stringify({ counter: 999 }) + '\n')).is.not.equalTo(-1);
          assert.that(dataCounter).is.greaterThan(1);
          res.removeAllListeners();
          done();
        });
      });
      req.end();
    });

    test('returns a 404 if the requested path could not be found.', function (done) {
      var req;

      req = https.request(serverUrl + '/non-existent', function (res) {
        assert.that(res.statusCode).is.equalTo(404);
        done();
      });

      req.end();
    });

    test('emits an error if the host could not be resolved.', function (done) {
      var req;

      req = https.request('https://localhorst:8080');

      req.once('error', function (err) {
        assert.that(err).is.not.null();
        done();
      });

      req.end();
    });
  });
});
