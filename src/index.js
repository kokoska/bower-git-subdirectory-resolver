'use strict';

var path = require('path'),
    fs = require('fs-extra'),
    tmp = require('tmp'),
    Q = require('q'),
    cmd = require('./cmd');

module.exports = function GitSubdirectoryResolver(/*bower*/) {
    //var owner, repo, tag, subDir, version, cloneDir, moduleDir;
    var server, tag, subDir, cloneDir, moduleDir;

    function log() {
        var args = Array.prototype.slice.apply(arguments);
        args.unshift('GitSubdirectoryResolver');
        console.log.apply(console, args);
    }

    // Given a dependency string, determine if this resolver supports
    // the dependency pattern
    function matchTag(source) {
        var tagPattern =
            /*
             Tag pattern to opt-in to the subdirectory resolver.

             Example:
               urbn/JsUrbnKit#bower^angular-log-decorator^v1.2.3

             Owner:   urbn
             Repo:    JsUrbnKit
             Subdir:  bower/angular-log-decorator
             Version: 1.2.3

             Github owner
              |          Github repo
              |          |         Folder path, ^ separated
              |          |         |               Version tag
              |          |         |               |
              V          V         V               V
              _______    _______   ______________  ____________           */
            ///([\w\-]+)\/([\w\-]+)\^((?:[\w\-]+\^)+)(v?\d\.\d\.\d)/i,
			/([\w\-]+\@[\w\-\.]+:[\w\-]+\.git)(#[\w]+)? ([\w\-\/]+)/i,
			//git@git.netcode.lt:base.git
            matches;

        log(arguments, source, tagPattern);
        matches = source.match(tagPattern);

        if (matches && matches.length === 4) {
            server = matches[1];
            tag = matches[2] == undefined ? "" : matches[2];
            subDir = matches[3];
			log(server, tag, subDir);
            //subDir = path.join.apply(this, matches[3].split('^'));
            //version = matches[4];
            return true;
        }

        return false;
    }

    // Fetch the content and resolve with the following data structure:
    //   {
    //       tempPath: <path-to-directory-containing-module-contents>,
    //       removeIgnores: <Boolean>
    //    }
    function fetchContent(/*endpoint, cached*/) {
        var gitUrl;

        // If cached version of package exists, re-use it
        // if (cached && cached.version) {
        //     return;
        // }

        cloneDir = tmp.dirSync().name;
        //gitUrl = 'git@github.com:' + owner + '/' + repo + '.git';
        gitUrl = server + tag;

        log('Cloning', [ 'clone', gitUrl, cloneDir ]);

        return cmd.spawn('git', [ 'clone', gitUrl, cloneDir, '--progress' ], {})
                  .progress(onProgress)
                  // @todo: Checkout the specified tag from the cloned repo,
                  // quick attempt below didn't work
                  // .then(cmd.spawn.bind(cmd, 'cd', [ cloneDir ], {}))
                  // .progress(onProgress)
                  // .then(cmd.spawn.bind(cmd, 'git', [ 'checkout', tag ], {}))
                  // .progress(onProgress)
                  .then(onSuccess)
                  .catch(onFail);
    }

    function onFail(err) {
        log('Command failed!', err);
        return Q.reject(err);
    }

    function onProgress(data) {
        if (data && data.stdout) {
            console.log(data.stdout);
        }
        if (data && data.stderr) {
            console.log(data.stderr);
        }
    }

    function onSuccess() {
        // Clone succeeded.  Copy the specified subdirectory from the full
        // clone directory into a new temp directory and return that to bower
        moduleDir = tmp.dirSync().name;
        fs.copySync(path.join(cloneDir, subDir), moduleDir);
        fs.removeSync(cloneDir);

        // Inform bower of the copied subdirectory folder
        return Q.when({
            tempPath: moduleDir,
            removeIgnores: true
        });
    }

    return {
        match: matchTag,
        fetch: fetchContent

        // Optional:
        // Allows to list available versions of given source.
        // Bower chooses matching release and passes it to "fetch"
        // releases: function (source) {
        //     log('releases', source);
        //     return [
        //         { target: 'v0.1.0', version: '0.1.0' }
        //     ]
        // },
    };
};

//    "nc-tabs": "git@git.netcode.lt:base.git#dab9ca51b9d5c4483d7220b592a9b77e17c6fe5f"
//    "nc-tabs": "git@git.netcode.lt:base.git web-ui/nc-tabs"

