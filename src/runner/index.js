import Promise from 'bluebird';
import chalk from 'chalk';
import extend from 'lodash.assign';

import { chain, concurrent } from './promises-util';
import { createTest, concurrencyLimit } from './providers/saucelabs';
import { print, saveLogs, saveResults } from './logs-saver';



export function run(browsers, testCases, { userName, accessToken }) {
    // define tests for all websites in all browsers (from current config file)
    let testingSessions = Object.keys(browsers)
    .map((browserName) => ({
        test: createTest(browsers[browserName], userName, accessToken),
        browser: extend({
            name: browserName
        }, browsers[browserName])
    }))
    .map(({ test, browser }) =>
        () =>
            chain(
                Promise.resolve()
                    .then(_log(chalk.cyan.bold(` > started tests in browser ${chalk.underline(browser.name)}`)))
                    .then(test.enter()),
                Object.keys(testCases)
                    .map((testCaseName) =>
                        (prev) =>
                            prev
                            .then(_log(chalk.cyan(` > > started test ${chalk.underline(testCaseName)}`)))
                            .then(test.open('http://main-c9-erykpiast.c9.io/'))
                            .then(test.execute(testCases[testCaseName]))
                            .then(test.sleep(1000))
                            // .then(test.moveMouse(10, 10))
                            .then(test.getResults())
                            .then((results) => {
                                saveResults(testCaseName, browser.name, results);
                            })
                            .then(test.getBrowserLogs())
                            .then((logs) => {
                                saveLogs(testCaseName, browser.name, logs);
                            })
                    )
            ).then(
                _log(chalk.green.bold(` > finished tests in browser ${chalk.underline(browser.name)}`)),
                _log(chalk.green.red(` ! failed tests in browser ${chalk.underline(browser.name)}`))
            ).then(test.quit())
    );


    // run all tests with some concurrency
    concurrent(testingSessions, concurrencyLimit)
        .then(() => {
            print();
        }, () => {
            print();
        }).done();
}


/**
 * @function log - functional-style logger, transparent when used with Promises
 * @returns {Function} function that logs arguments passed to factory and
 *                     returns passed data or rethrows passed error
 */
function _log() {
    var args = arguments;

    return (data) => {
        console.log(...args);

        if(data instanceof Error) {
            throw data;
        } else {
            return data;
        }
    };
}