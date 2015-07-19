import extend from 'lodash.assign';

import { concurrent } from './promises-util';
import parseBrowsers from './parse-browsers';
import { createTest, concurrencyLimit } from './providers/saucelabs';


export default function run(browsers, code, { userName, accessToken }) {
    let parsed = parseBrowsers(browsers);
    // define tests for all websites in all browsers (from current config file)
    let testingSessions = Object.keys(parsed)
    .map((browserName) => ({
        test: createTest(parsed[browserName], userName, accessToken),
        browser: extend({
            name: browserName
        }, parsed[browserName])
    }))
    .map(({ test, browser }) =>
        () =>
            Promise.resolve()
            // we need very simple page always available online
            .then(test.open('http://blank.org/'))
            .then(test.execute(code))
             // wait a while for script execution; later on some callback-based
             // solution should be used
            .then(test.sleep(1000))
            .then(() =>
                Promise.all([
                    test.getResults(),
                    test.getBrowserLogs()
                ]).then((results, logs) => ({
                    browser: browser.name,
                    results,
                    logs
                }))
            ).then(
                // quit no matter if test succeed or not
                test.quit(),
                test.quit()
            ).catch((err) => {
                // suppress any error,
                // we want to continue tests in other browsers
                console.error(err);
            })
    );


    // run all tests with some concurrency
    return concurrent(testingSessions, concurrencyLimit)
        .then((resultsForAllTests) =>
            resultsForAllTests.reduce((map, { browser, results, logs }) => {
                map[browser] = { results, logs };
                
                return map;
            })
        );
}