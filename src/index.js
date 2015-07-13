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
            .then(test.open('http://main-c9-erykpiast.c9.io/'))
            .then(test.execute(code))
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
                test.quit(),
                test.quit()
            )
    );


    // run all tests with some concurrency
    return concurrent(testingSessions, concurrencyLimit)
        .then((results) => 
            results.reduce((map, { browser, results, logs }) => {
                map[browser] = { results, logs };
                
                return map;
            })
        );
}