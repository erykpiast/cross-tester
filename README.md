# cross-tester
Utility for automated cross-browser testing. It allows to execute piece of
JavaScript code in many browsers (using SauceLabs or BrowserStack Selenium/Appium
grid) and compare results for each one.

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
  browsers: {
    'Google Chrome': { // just a display name
      name: 'Chrome', // actual browser name
      versions: {
        'Display name (ex. latest)': '46',
        'Display name (ex. the last supported)': '38'
      },
      platform: 'Windows',
      osVersion: '10' // optional, can be guessed in most cases
    },
    'iOS Safari': {
      name: 'Safari',
      versions: {
        'latest iPhone': {
          osVersion: '9.2',
          deviceName: 'iPhone',
          devices: ['6', '6 Plus', '5S'] // second part of device name, all of those
          // will be combined with the first one, creating 3 testing configurations
        },
        'ex. previous iPad': {
          osVersion: '8.4',
          deviceName: 'iPad',
          devices: ['Retina', 'Air', '2']
        }
      },
      platform: 'iOS' // name of the platform in SL
    },
    'Android Browser': {
      name: 'Android Browser',
      versions: {
        'Lollipop': '5.0',
        'KitKat': 'KitKat' // you can use codenames Android and OS X; in case
        // of the first one, the newest version is used (ex. Jelly Bean => 4.3)
      }
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
directory in case of local installation). Provide a name of Selenium/Appium grid
service of your choice with `-p` parameter, user and access token with
`-u` and `-a` (those three are only required parameters), code with `-c` and
list of browsers with `-b` (the last one has to be valid JSON object, so I
recommend to simply edit executable file). Full-featured CLI program is coming!

## Notes
Some mobile browsers on BrowserStack doesn't work really well. It seems like
issue of the service, but maybe can be resolved on client side. Help is
appreciated.
