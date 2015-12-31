# cross-tester
Utility for automated cross-browser testing. It allows to execute piece of
JavaScript code in many browsers (using SauceLabs Selenium/Appium grid) and
compare results for each one.

## Installation

```
npm install cross-tester
```

## Usage

```javascript
import runCode from 'cross-tester';

runCode({
  code: myCode,
  credentials: {
    userName: 'myUserNameOnSauceLabs',
    accessToken: 'myAccessTokenToSauceLabsAccount'
  },
  // use configurator (https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/)
  // to find out names of things in SauceLabs (SL) environment
  browsers: {
    'Display name (ex. Google Chrome)': {
      name: 'Chrome', // name of the browser in SL
      versions: {
        'Display name (ex. latest)': '46',
        'Display name (ex. the last supported)': '38'
      },
      platform: 'Windows', // name of the platform in SL
      osVersion: '10' // notice, that in SL it doesn't make sense for Linux platform
    },
    'Display name (ex. iOS Safari)': {
      name: 'Safari', // name of the browser in SL,
      versions: {
        'Display name (ex. latest iPhone)': {
          osVersion: '9.2',
          deviceName: 'iPhone', // name of testing device in SL
          devices: ['6', '6 Plus', '5S'] // second part of device name, all of those
          // will be combined with the first one, creating 3 testing configurations
        },
        'Display name (ex. previous iPad)': {
          osVersion: '8.4',
          deviceName: 'iPad', // name of testing device in SL
          devices: ['Retina', 'Air', '2'] // second part of device name, all of those
          // will be combined with the first one, creating 3 testing configurations
        }
      },
      platform: 'iOS' // name of the platform in SL
    }
  }
}).then(
  (results) => console.log(results),
  // promise will be rejected only when error inside tester occured, it's resolved
  // even if test in one of the browsers failed
  (err) => console.error(err)
);
```

## CLI
It's also possible to use simple CLI interface. You can find it as `cross-tester`
in your path after installing the package globally (or inside `./node_modules/.bin`
directory in case of local installation). Provide user and access token with
`-u` and `-a` parameters (those are only required ones), code with `-c` and
list of browsers with `-b` (the last one has to be valid JSON object, so I
recommend to simply edit executable file). Full-featured CLI program is coming!

## BrowserStack?
Support in progress.
