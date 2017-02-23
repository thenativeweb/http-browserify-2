'use strict';

/* eslint-env browser, mocha */

const assert = require('assert'),
      url = require('url');

const http = require('../../http'),
      https = require('../../https');

const getLocationOrigin = function () {
  if (!location.origin) {
    const port = location.port ? `:${location.port}` : '';

    location.origin = `${location.protocol}//${location.hostname}${port}`;
  }

  return location.origin;
};

const serverUrl = getLocationOrigin();
const server = url.parse(serverUrl);

suite('http-browserify-2', function () {
  this.timeout(10 * 1000);

  suite('http', () => {
    test('has status codes', done => {
      assert.equal(http.STATUS_CODES[200], 'OK');
      done();
    });
  });

  suite('https', () => {
    test('is an object.', done => {
      assert.equal(typeof https, 'object');
      done();
    });

    suite('get', () => {
      test('is a function.', done => {
        assert.equal(typeof https.get, 'function');
        done();
      });

      test('throws an error if options are missing.', done => {
        assert.throws(
          () => {
            https.get();
          },
          'Options are missing.'
        );
        done();
      });

      test('emits an error if the host could not be resolved.', done => {
        const req = https.get('https://localhorst:8080');

        req.once('error', err => {
          assert.notEqual(err, null);
          done();
        });
      });

      suite('gets the content of a website', () => {
        test('by its url.', done => {
          https.get(`${serverUrl}/`, res => {
            let content = '';

            assert.equal(res.statusCode, 200);

            res.on('data', data => {
              content += data.toString('utf8');
            });

            res.once('end', () => {
              assert.equal(content, 'foobar');
              res.removeAllListeners();
              done();
            });
          });
        });

        test('by an options object.', done => {
          https.get({
            hostname: server.hostname,
            port: server.port,
            path: '/'
          }, res => {
            let content = '';

            assert.equal(res.statusCode, 200);

            res.on('data', data => {
              content += data.toString('utf8');
            });

            res.once('end', () => {
              assert.equal(content, 'foobar');
              res.removeAllListeners();
              done();
            });
          });
        });
      });
    });

    suite('request', () => {
      test('is a function.', done => {
        assert.equal(typeof https.request, 'function');
        done();
      });

      test('throws an error if options are missing.', done => {
        assert.throws(() => {
          https.request();
        }, 'Options are missing.');
        done();
      });

      suite('gets the content of a website', () => {
        test('by its url.', done => {
          const req = https.request(`${serverUrl}/`, res => {
            let content = '';

            assert.equal(res.statusCode, 200);

            res.on('data', data => {
              content += data.toString('utf8');
            });

            res.once('end', () => {
              assert.equal(content, 'foobar');
              res.removeAllListeners();
              done();
            });
          });

          req.end();
        });

        test('by an options object.', done => {
          const req = https.request({
            method: 'GET',
            hostname: server.hostname,
            port: server.port,
            path: '/'
          }, res => {
            let content = '';

            assert.equal(res.statusCode, 200);

            res.on('data', data => {
              content += data.toString('utf8');
            });

            res.once('end', () => {
              assert.equal(content, 'foobar');
              res.removeAllListeners();
              done();
            });
          });

          req.end();
        });
      });
    });

    test('supports POST.', done => {
      const req = https.request({
        method: 'POST',
        hostname: server.hostname,
        port: server.port,
        path: '/'
      }, res => {
        let content = '';

        assert.equal(res.statusCode, 200);

        res.on('data', data => {
          content += data.toString('utf8');
        });

        res.once('end', () => {
          assert.equal(content, 'barfoo');
          res.removeAllListeners();
          done();
        });
      });

      req.end();
    });

    test('supports sending data.', done => {
      const req = https.request({
        method: 'POST',
        hostname: server.hostname,
        port: server.port,
        path: '/with-body',
        headers: {
          'content-type': 'application/json'
        }
      }, res => {
        let content = '';

        assert.equal(res.statusCode, 200);

        res.on('data', data => {
          content += data.toString('utf8');
        });

        res.once('end', () => {
          assert.equal(content, JSON.stringify({ foo: 'bar' }));
          res.removeAllListeners();
          done();
        });
      });

      req.write(JSON.stringify({ foo: 'bar' }));
      req.end();
    });

    test('handles query strings.', done => {
      const req = https.request({
        method: 'GET',
        hostname: server.hostname,
        port: server.port,
        path: '/with-querystring?value=82517'
      }, res => {
        let content = '';

        assert.equal(res.statusCode, 200);

        res.on('data', data => {
          content += data.toString('utf8');
        });

        res.once('end', () => {
          assert.equal(content, '82517');
          res.removeAllListeners();
          done();
        });
      });

      req.end();
    });

    test('supports streaming.', done => {
      const req = https.request({
        method: 'POST',
        hostname: server.hostname,
        port: server.port,
        path: '/streaming'
      }, res => {
        let content = '',
            dataCounter = 0;

        assert.equal(res.statusCode, 200);

        res.on('data', data => {
          content += data.toString('utf8');
          dataCounter += 1;
        });

        res.once('end', () => {
          assert.notEqual(content.indexOf(`${JSON.stringify({ counter: 0 })}\n`), -1);
          assert.notEqual(content.indexOf(`${JSON.stringify({ counter: 999 })}\n`), -1);
          assert.ok(dataCounter > 1);
          res.removeAllListeners();
          done();
        });
      });

      req.end();
    });

    test('returns a 404 if the requested path could not be found.', done => {
      const req = https.request(`${serverUrl}/non-existent`, res => {
        assert.equal(res.statusCode, 404);
        done();
      });

      req.end();
    });

    test('emits an error if the host could not be resolved.', done => {
      const req = https.request('https://localhorst:8080');

      req.once('error', err => {
        assert.notEqual(err, null);
        done();
      });

      req.end();
    });
  });
});
