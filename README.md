# http-browserify-2

http-browserify-2 is an alternative for http-browserify.

## Installation

    $ npm install http-browserify-2

## Quick start

First you need to register http-browserify-2 as a replacement to the `http` and `https` modules in your application's `package.json` file.

```json
{
  "browser": {
    "http": "http-browserify-2/http",
    "https": "http-browserify-2/https"
  }
}
```

Then you may use it in the same way as the aforementioned modules. Currently, the functions [`request`](https://nodejs.org/api/http.html#http_http_request_options_callback) and [`get`](https://nodejs.org/api/http.html#http_http_get_options_callback) are implemented.

```javascript
var req = http.request({
  method: 'GET',
  hostname: 'www.thenativeweb.io',
  port: 80,
  path: '/'
}, function (res) {
  // Use the response stream and its properties, such as statusCode.
});

req.end();
```

Additionally, you can access the `STATUS_CODES` property to get a map of status codes to human readable messages.

```javascript
console.log(http.STATUS_CODES[200]); // => 'OK'
```

For further details on how to use these functions see their documentation.

### Supported browsers

The module was successfully tested with the help of [zuul](https://github.com/defunctzombie/zuul) and [Sauce Labs](https://saucelabs.com/) in the following browsers:

- Chrome 43
- Firefox 37
- Safari 8
- Internet Explorer 10
- Internet Explorer 11
- iOS 8.2
- Android 5.1

## Running the build

This module can be built using [Grunt](http://gruntjs.com/). This analyses the code. To run Grunt, go to the folder where you have installed http-browserify-2 and run `grunt`. You need to have [grunt-cli](https://github.com/gruntjs/grunt-cli) installed.

Additionally, you can run tests in the browser. For this, you need [zuul](https://www.npmjs.com/package/zuul) and Grunt.

    $ grunt test-browser

If you want to run the integration tests on multiple browsers, use the `test-browsers` task.

    $ grunt test-browsers

Please note that for this you need a [Sauce Labs](https://saucelabs.com/) account. Additionally, you need to [configure zuul](https://github.com/defunctzombie/zuul/wiki/Cloud-testing) to be able to access the account automatically.

## License

The MIT License (MIT)
Copyright (c) 2015 the native web.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
