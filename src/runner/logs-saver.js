import chalk from 'chalk';
import moment from 'moment';


const levels = {
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

let saved = { };


function _indent(level) {
    return (string) =>
        string.split('\n')
            .map((line) => ' '.repeat(level) + line)
            .join('\n');
}


function _saveData(key, testName, browserName, data) {
        if(!saved.hasOwnProperty(testName)) {
            saved[testName] = { };
        }
        
        if(!saved[testName].hasOwnProperty(browserName)) {
            saved[testName][browserName] = { };
        }
    
        saved[testName][browserName][key] = data;
}


export function saveLogs(testName, browserName, logs = []) {
    return _saveData('logs', testName, browserName, logs.map(_prepareLogString));
}

export function saveResults(testName, browserName, results = []) {
    return _saveData('results', testName, browserName, results
        .map((result) => JSON.stringify(result, null, '  '))
        .map(_indent(10))
    );
}


export function print() {
    console.log(chalk.yellow('-'.repeat(80)));
    
    Object.keys(saved).forEach((testName) => {
        console.log(chalk.yellow(` - ${testName}`));

        Object.keys(saved[testName]).forEach((browserName) => {
            console.log(chalk.yellow(` - - ${browserName}`));
            
            Object.keys(saved[testName][browserName]).forEach((dataType) => {
                console.log(chalk.yellow(` - - - ${dataType}`));

                saved[testName][browserName][dataType]
                    .forEach((data) => console.log(data));
            });
        });
    });

    console.log(chalk.yellow('-'.repeat(80)));
}


export function get(testName, browserName) {
    if('undefined' !== typeof testName) {
        if('undefined' !== typeof browserName) {
            return saved[testName][browserName];
        } else {
            throw new Error(`logs for test ${testName} in browser ${browserName} not found`);
        }
    } else {
        throw new Error('you have to provide website and browser at least!');
    }
}

function _prepareLogString({ timestamp, level, file, line, message }) {
    return [
        chalk.gray(moment(timestamp).format('YYYY-MM-DD hh:mm:ss.SSS')),
        chalk[(levels[level] || { color: 'white' }).color](level),
        chalk.underline('File') + ': ' + (file || 'unknown'),
        chalk.underline('Line') + ': ' + (line || 'unknown'),
        chalk.underline('Message') + ': ' + message
    ].join(' ');
}
