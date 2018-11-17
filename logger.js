const moment = require('moment');
const consoleControl = require('console-control-strings');

module.exports.log = (str) => {
    process.stdout.write(`[        ] [${moment().format('DD-MM-YY HH:MM:ss')}] - ${str}`);
};

module.exports.panic = (str) => {
    process.stdout.write(`${consoleControl.color('red')}PANIC: ${str}${consoleControl.color('reset')}\n`);
    process.exit(1);
};

// Post print
module.exports.ok = () => {
    process.stdout.write(`${consoleControl.gotoSOL()}[   ${consoleControl.color('green')}OK${consoleControl.color('reset')}   ]\n`);
};

module.exports.failed = () => {
    process.stdout.write(`${consoleControl.gotoSOL()}[ ${consoleControl.color('red')}FAILED${consoleControl.color('reset')} ]\n`);
};

module.exports.warn = () => {
    process.stdout.write(`${consoleControl.gotoSOL()}[  ${consoleControl.color('yellow')}WARN${consoleControl.color('reset')}  ]\n`);
};

module.exports.info = () => {
    process.stdout.write(`${consoleControl.gotoSOL()}[  ${consoleControl.color('blue')}INFO${consoleControl.color('reset')}  ]\n`);
};

// Pre print
module.exports.logOk = (str) => {
    process.stdout.write(`[   ${consoleControl.color('green')}OK${consoleControl.color('reset')}   ] [${moment().format('DD-MM-YY HH:MM:ss')}] - ${str}\n`);
};

module.exports.logFailed = (str) => {
    process.stdout.write(`[ ${consoleControl.color('red')}FAILED${consoleControl.color('reset')} ] [${moment().format('DD-MM-YY HH:MM:ss')}] - ${str}\n`);
};

module.exports.logWarn = (str) => {
    process.stdout.write(`[  ${consoleControl.color('yellow')}WARN${consoleControl.color('reset')}  ] [${moment().format('DD-MM-YY HH:MM:ss')}] - ${str}\n`);
};

module.exports.logInfo = (str) => {
    process.stdout.write(`[  ${consoleControl.color('blue')}INFO${consoleControl.color('reset')}  ] [${moment().format('DD-MM-YY HH:MM:ss')}] - ${str}\n`);
};