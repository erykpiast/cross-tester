import chalk from 'chalk';
import fs from 'fs';
import { run } from './runner';
import { get as getTestCases } from './test-cases';
import { flatten as flattenBrowsers } from './parse-browsers';


// loading config >>
let configName = process.argv[2];
if(!configName) {
    _exit('no config name provided', 1);
}

let configPath = `${__dirname}/conf/${configName}.json`;
if(!fs.existsSync(configPath)) {
    _exit('unkown config name provided', 1);
}

const { browsers, concurrencyLimit } = JSON.parse(fs.readFileSync(configPath));
// << loading config

if(!process.env.SAUCELABS_USERNAME || !process.env.SAUCELABS_ACCESSTOKEN) {
    _exit(`Credentials for SauceLabs not provided. Set both SAUCELABS_USERNAME
        and SAUCELABS_ACCESSTOKEN enviroment variables before running the script.`, 1);
}


console.log(chalk.cyan.bold('compiling test cases...'));
getTestCases().then((testCases) => {
    console.log(chalk.cyan.bold(`starting tests with config "${configName}" and concurrency limit ${concurrencyLimit}...`));
    run(flattenBrowsers(browsers), testCases, {
        userName: process.env.SAUCELABS_USERNAME,
        accessToken: process.env.SAUCELABS_ACCESSTOKEN
    });
}, (err) => console.log(chalk.red.bold(`error when compiling test cases: ${err.message}`)));


function _exit(message, errorCode) {
    console.error(chalk.red(message));
    process.exit(errorCode);
}

