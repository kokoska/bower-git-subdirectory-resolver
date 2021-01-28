'use strict';

var cp = require('child_process'),
    Q = require('q');

/*
 * Promisify a node child_process
 * @return {[type]} [description]
 */
function spawn(cmd, args, opts) {
    var process = cp.spawn(cmd, args, opts),
        dfd = Q.defer();


    process.stdout.on('data', function (data) {
        dfd.notify({ stdout: data.toString() });
    });

    process.stderr.on('data', function (data) {
        dfd.notify({ stderr: data.toString() });
    });

    process.on('error', dfd.reject);

    // Listen to the close event instead of exit
    // They are similar but close ensures that streams are flushed
    process.on('close', function (code) {
        if (code) {
            return dfd.reject(code);
        }
        dfd.resolve(code);
    });

    return dfd.promise;
}

module.exports = {
    spawn: spawn
};
