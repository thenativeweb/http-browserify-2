'use strict';

const roboter = require('roboter');

roboter.
  workOn('server').
  equipWith(task => {
    task('universal/analyze', {
      src: [ '**/*.js', '!node_modules/**/*.js', '!coverage/**/*.js', '!dist/**/*.js', '!dist-test/**/*.js' ]
    });

    task('universal/release', {
      createDistribution: true
    });

    task('universal/shell', {
      'test-browser': [
        './node_modules/.bin/babel test --out-dir dist-test --presets=es2015',
        'zuul --ui mocha-tdd --local 8080 --tunnel --open -- dist-test/e2e/requestTests.js'
      ].join(' && '),
      'test-browsers': [
        './node_modules/.bin/babel test --out-dir dist-test --presets=es2015',
        'zuul -- dist-test/e2e/requestTests.js'
      ].join(' && ')
    });

    task('universal/license', {
      compatible: [
        // Individual licenses
        'Apache-2.0', 'Apache-2.0*',
        'BSD-2-Clause', 'BSD-3-Clause',
        'ISC',
        'MIT', 'MIT/X11', 'MIT*',
        'MIT Licensed. http://www.opensource.org/licenses/mit-license.php',
        'Public Domain',
        'Unlicense',

        // Combined licenses
        '(Apache-2.0 OR MPL-1.1)',
        'BSD-3-Clause OR MIT',
        '(MIT AND CC-BY-3.0)',
        '(WTFPL OR MIT)'
      ],

      ignore: {
        // BSD-3-Clause, see https://github.com/deoxxa/duplexer2/blob/0.0.2/LICENSE.md
        duplexer2: '0.0.2',

        // MIT, see https://github.com/mklabs/node-fileset/blob/v0.2.1/LICENSE-MIT
        fileset: '0.2.1',

        // MIT, see https://github.com/tarruda/has/blob/1.0.1/package.json
        has: '1.0.1',

        // BSD-2-Clause, see https://github.com/facebook/regenerator/blob/e22c9317987ebcf4041e9188cb208b94f662df35/LICENSE
        'regenerator-transform': '0.9.8',

        // BSD-2-Clause, see https://github.com/jviereck/regjsparser/blob/0.1.5/LICENSE.BSD
        regjsparser: '0.1.5',

        // MIT, see https://github.com/eugeneware/unique-stream/blob/v1.0.0/LICENSE
        'unique-stream': '1.0.0'
      }
    });
  }).
  start();
