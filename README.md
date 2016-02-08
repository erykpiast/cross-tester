# cross-tester
The tool allows to execute piece of JavaScript code in many browsers (using
SauceLabs or BrowserStack Selenium/Appium grid) and compare results for each one.

## Installation

```
npm install cross-tester
```

## Usage

```javascript
import runCode from 'cross-tester';

runCode({
  provider: 'saucelabs or browserstack', // chose one of those
  code: 'window.__results__.push(666)', // push anything to global __results__
  // array if you want to see it in results; you don't have to provide a code
  url: 'http://output.jsbin.com/kovanuyiqu', // URL to website with code is OK too
  timeout: 2000 // specify, how long to wait for results (1000 ms is defualt)
  credentials: {
    userName: 'myUserName',
    accessToken: 'myAccessToken'
  },
  browsers: [{
    displayName: 'Google Chrome on Mac',
    name: 'chrome',
    version: '46',
    os: 'os x',
    osVersion: '10.10'
  }, {
    displayName: 'Mozilla Firefox on Mac',
    name: 'firefox',
    version: '42',
    os: 'os x',
    osVersion: '10.10'
  }, {
    displayName: 'Safari Desktop',
    name: 'safari',
    version: '9',
    os: 'os x',
    osVersion: '10.11'
  }, {
    displayName: 'Internet Explorer',
    name: 'internet explorer',
    version: '11',
    os: 'windows',
    osVersion: '8.1'
  }, {
    displayName: 'MS Edge',
    name: 'edge',
    // take the only available version in SL and BS; it's behavior specific for
    // Microsoft Edge
    version: undefined,
    os: 'windows',
    osVersion: '10'
  }, {
    displayName: 'Android Browser',
    name: 'android browser',
    version: '5.0',
    os: 'android',
    osVersion: '5'
  }, {
    displayName: 'iPhone Safari',
    name: 'safari mobile',
    version: '9.0',
    os: 'ios',
    osVersion: '9.0',
    device: 'iphone'
  }]
}).then(
  (results) => console.log(results),
  // promise will be rejected only when error inside the tester occured, it's
  // resolved even if test in one of the browsers failed
  (err) => console.error(err)
);
```

## CLI
It's also possible to use simple CLI interface. You can find it as `cross-tester`
in your path after installing the package globally (or inside `./node_modules/.bin`
directory in case of local installation). Provide a name of Selenium/Appium grid
service of your choice with `-p` parameter, user and access token with
`-u` and `-a` (those three are only required parameters), code with `-c` (or URL
with `-s`) and json file containing list of browsers with `-b` (the last one has
to be valid JSON object, so I recommend to simply edit executable file). Full
featured CLI program is coming!

## Notes
Some mobile browsers on BrowserStack doesn't work really well. It seems like
issue of the service, but maybe can be resolved on client side. Help is
appreciated.
