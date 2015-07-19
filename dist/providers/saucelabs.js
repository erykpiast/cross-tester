'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.createTest = createTest;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _wd = require('wd');

var _wd2 = _interopRequireDefault(_wd);

// it's soo cool to override globals! (yes, Promise is one for some time)

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _url = require('url');

var levels = {
    'SEVERE': {
        value: 1100,
        color: 'red'
    },
    'ERROR': {
        value: 1000,
        color: 'red'
    },
    'WARNING': {
        value: 900,
        color: 'yellow'
    },
    'INFO': {
        value: 800,
        color: 'cyan'
    },
    'LOG': {
        value: 800,
        color: 'cyan'
    },
    'DEBUG': {
        value: 700,
        color: 'magenta'
    }
};

var ignoredLogs = [
// useful hints from Firefox, we don't need them to be printed
'Using //@ to indicate sourceURL pragmas is deprecated', 'Using //@ to indicate sourceMappingURL pragmas is deprecated', 'Use of getPreventDefault() is deprecated', 'Use of Mutation Events is deprecated', 'Empty string passed to getElementById()', 'Use of attributes\' nodeValue attribute is deprecated', 'This site makes use of a SHA-1 Certificate', 'Use of getAttributeNode() is deprecated', 'mutating the [[Prototype]] of an object will cause your code to run very slowly', 'Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user\'s experience', 'An unbalanced tree was written using document.write() causing data from the network to be reparsed', 'HTMLVideoElement.webkitSupportsFullscreen\' is deprecated', 'Expected ,\' in media list but found \'screen', 'Expected \',\' in media list but found \'and(\'', 'Unexpected end of file while searching for closing } of invalid rule set', 'Property contained reference to invalid variable',
// CSS related
'Declaration dropped', 'Ruleset ignored due to bad selector', 'Expected declaration but found', 'Expected media feature name but found', 'Unrecognized at-rule', 'Keyframe rule ignored due to bad selector',
// addons stuff
'Could not read chrome manifest', 'blocklist is disabled', 'Trying to re-register CID', 'chrome-extension://', 'resource://', 'Native module at path', 'Failed to load native module at path', 'Component returned failure code',
// Facebook script
'Invalid App Id: Must be a number or numeric string representing the application id.', 'The "fb-root" div has not been created, auto-creating', 'FB.getLoginStatus() called before calling FB.init().', 'FB.init has already been called - this could indicate a problem',
// SalesManago
'app2.salesmanago.pl', 'Displaying ad:', 'No slot for:', 'SM AP:',
// Qualtrics
'Please remove it from your site or contact your Qualtrics Administrator',
// just useless here
'server does not support RFC 5746, see CVE-2009-3555', 'Mixed Content', 'downloadable font', 'Unexpected end of file while searching for end of @media, @supports or @-moz-document rule', 'Blocked loading mixed active content', 'The character encoding of the HTML document was not declared', 'A call to document.write() from an asynchronously-loaded external script was ignored', 'Failed to execute \'write\' on \'Document\'', 'Password fields present on an insecure (http://) page', 'Password fields present in a form with an insecure (http://) form action', 'WebGL: Error during native OpenGL init', 'WebGL: WebGL creation failed', 'to start media query expression but found', 'The page was reloaded, because the character encoding declaration of the HTML document was not found when prescanning the first 1024 bytes of the file', 'Refused to set unsafe header', 'The character encoding of a framed document was not declared', 'While creating services from category', 'unrecognized command line flag'];

var RESULTS_ARRAY_NAME = 'window.__results__';

var DEFAULT_TIMEOUT = 30 * 1000;
var chromeLogMessagePattern = /^(javascript|(?:(?:https?|chrome-extension)\:\/\/\S+))\s+(\d+:\d+)\s+(.*)$/i;
var firefoxAddonLogPattern = /^(\d{13})\t(\S*(?:addons|extensions)\S*)\t([A-Z]+)\t(.*)\n?$/i;
var androidEmulatorLogMessagePattern = /^\[([0-9\-\A-Z:]+)\](?:\s+\[[A-Z]+\]\s+[A-Z]{1}\/[a-z0-9\/\._]+\s*(?:\[[^\]]+\])?\(\s+\d+\)\:\s+)?(?:\-+\s+beginning\s+of\s+[a-z]+)?(.*)$/i;
var androidEmulatorLogBrowserMessagePattern = /^\[([0-9\-\A-Z:]+)\]\s+\[[A-Z]+\]\s+I\/chromium\(\s+\d+\)\:\s+\[([A-Z]+)\:CONSOLE\(\d+\)\]\s+\"(.*)",\s+source\:\s+(\S*)\s+\((\d+)\)$/i;

var concurrencyLimit = 8;

exports.concurrencyLimit = concurrencyLimit;

function createTest(browser, userName, accessToken) {
    var driver = undefined;
    var browserLogs = [];
    var browserLogsGot = 0;
    var sessionId = null;

    function enter() {
        return function () {
            driver = _wd2['default'].promiseRemote('ondemand.saucelabs.com', 80, userName, accessToken);

            // maybe we can use this?
            // wd.configureHttp({
            //   timeout: 10000,
            //   retries: 3,
            //   retryDelay: 100
            // });
            return _bluebird2['default'].race([_bluebird2['default'].delay(DEFAULT_TIMEOUT).then(function () {
                throw new Error('cannot connect to SauceLabs in 10 seconds');
            }), driver.init(browser).then(function (_session_) {
                sessionId = _session_[0];

                return _session_[1];
            }, function (err) {
                if (err.message.match(/(The environment you requested was unavailable)|(Browser combination invalid)/)) {
                    throw new Error('browser ' + browser.browserName + ' ' + browser.version + ' is not supported (' + err.message + ')');
                } else {
                    throw err;
                }
            })]);
        };
    }

    function _formatUrl(url) {
        var _parseUrl = (0, _url.parse)(url);

        var protocol = _parseUrl.protocol;
        var hostname = _parseUrl.hostname;
        var port = _parseUrl.port;
        var pathname = _parseUrl.pathname;

        return [protocol ? protocol + '//' : '', hostname, port && port !== 80 ? ':' + port : '', pathname].join('');
    }

    function getBrowserLogs(levelName) {
        var level = (levels[levelName] || { value: 0 }).value || levels.INFO.value;

        return function () {
            return driver.logTypes().then(function (types) {
                return Array.isArray(types) && types.indexOf('browser') !== -1 ? driver.log('browser') : _bluebird2['default'].resolve([]);
            }, function () {
                return [] // supress error
                ;
            }).then(function (logs) {
                return browserLogs = browserLogs.concat(logs);
            }).then(function (logs) {
                var notGot = logs.slice(browserLogsGot);

                browserLogsGot = logs.length;

                return notGot.filter(function (log) {
                    return levels[log.level].value >= level;
                });
            }).then(function (logs) {
                return (
                    // parse Firefox logs from addons and Chrome logs
                    logs.map(function (log) {
                        // parse logs from Firefox addons
                        var addonLog = log.message.match(firefoxAddonLogPattern);
                        if (addonLog) {
                            return {
                                addon: true,
                                timestamp: addonLog[1],
                                level: addonLog[3],
                                message: addonLog[2] + ': ' + addonLog[4]
                            };
                        }

                        // parse logs from Chrome
                        var chromeLogMessage = log.message.match(chromeLogMessagePattern);
                        if (chromeLogMessage) {
                            return {
                                addon: chromeLogMessage[1].indexOf('chrome-extension://') === 0,
                                timestamp: log.timestamp,
                                level: log.level,
                                file: _formatUrl(chromeLogMessage[1]),
                                line: chromeLogMessage[2],
                                message: chromeLogMessage[3]
                            };
                        }

                        // parse logs from Android emulator
                        if (log.message.match(androidEmulatorLogMessagePattern)) {
                            var androidEmulatorBrowserMessage = log.message.match(androidEmulatorLogBrowserMessagePattern);
                            if (androidEmulatorBrowserMessage) {
                                return {
                                    addon: false,
                                    timestamp: Date.parse(androidEmulatorBrowserMessage[1]),
                                    level: androidEmulatorBrowserMessage[2],
                                    file: androidEmulatorBrowserMessage[4] ? _formatUrl(androidEmulatorBrowserMessage[4]) : '',
                                    line: androidEmulatorBrowserMessage[5],
                                    message: androidEmulatorBrowserMessage[3]
                                };
                            } else {
                                return null;
                            }
                        }

                        // try to parse custom logs from TaniaKsiazka.pl
                        var parsed = undefined;
                        try {
                            parsed = JSON.parse(log.message);
                        } catch (err) {}

                        if (parsed && 'object' === typeof parsed.message && parsed.message !== null) {
                            return {
                                timestamp: Math.random(parsed.message.timestamp * 1000),
                                level: parsed.message.level,
                                file: _formatUrl(parsed.message.url),
                                line: parsed.message.line + ':' + parsed.message.column,
                                message: parsed.message.text
                            };
                        }

                        return log;
                    }).filter(function (log) {
                        return !log.addon;
                    }).filter(function (log) {
                        return !ignoredLogs.some(function (messageToIgnore) {
                            return log.message.indexOf(messageToIgnore) > -1;
                        });
                    })
                );
            }).then(function (logs) {
                return browserLogs = logs;
            });
        };
    }

    function getResults() {
        return function () {
            return driver.execute('return ' + RESULTS_ARRAY_NAME + ';');
        };
    }

    function execute(code) {
        return function () {
            return driver.safeExecute(code);
        };
    }

    function sleep(time) {
        return function () {
            return driver.sleep(time);
        };
    }

    function open(url) {
        return function () {
            return _bluebird2['default'].race([_bluebird2['default'].delay(DEFAULT_TIMEOUT).then(function () {
                throw new Error('cannot open page ' + url + ' in 10 seconds');
            }), driver.get(url).then(execute(RESULTS_ARRAY_NAME + ' = [];'))]);
        };
    }

    function quit() {
        return function () {
            return driver.quit();
        };
    }

    function getSessionId() {
        return function () {
            return sessionId;
        };
    }

    function moveMouse() {
        var element = undefined;
        var x = undefined;
        var y = undefined;
        var args = arguments;

        return function () {
            if (args.length > 2) {
                element = findElement(args[0]);
                x = parseInt(args[1], 10);
                y = parseInt(args[2], 10);
            } else {
                element = findElement('body');
                x = parseInt(args[0], 10);
                y = parseInt(args[1], 10);
            }

            return element.then(function (elementId) {
                return driver.moveTo(elementId, x, y);
            });
        };
    }

    function findElement(selector) {
        return driver.elementByCssSelector(selector).then(function (element) {
            return Array.isArray(element) ? element[0] : element;
        });
    }

    return {
        enter: enter,
        quit: quit,
        open: open,
        getSessionId: getSessionId,
        getBrowserLogs: getBrowserLogs,
        getResults: getResults,
        execute: execute,
        sleep: sleep,
        moveMouse: moveMouse
    };
}

/*[element], x, y*/