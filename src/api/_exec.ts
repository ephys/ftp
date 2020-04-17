const util = window.require('util');
const childProcess = window.require('child_process');

export const exec = util.promisify(childProcess.exec);
