var request = require('request');
var fs = require('fs');

var spawn = require('child_process').spawn;

var buildtools = {};

/**
 * @param cwd Working Directory
 * @param filename Filename to name download
 * @param cb Run when downloaded
 */
buildtools.download = function(cwd,filename,cb) {
    request('https://hub.spigotmc.org/jenkins/job/BuildTools/lastSuccessfulBuild/artifact/target/BuildTools.jar', function() {
        cb();
    }).pipe(fs.createWriteStream(cwd+filename))
};

/**
 *
 * @param cwd Working directory of BuiltTools
 * @param filename Filename of buildtools jar
 * @param cb run when buildtools exits
 */
buildtools.compile = function(cwd,filename,version,cb) {
    if (cb == undefined) {
        cb = version;
        version = "latest";
    }

    // Start BuildTools process
    var BuildToolsProc = spawn('java', [
        '-jar', filename,
        '--rev', version
    ], {
        cwd: cwd
    });

    // Log stdout
    BuildToolsProc.stdout.on('data', function(data) {
        console.log('[BuildTools]', data.toString().replace("\n",""));
    });

    // Log stderr
    BuildToolsProc.stderr.on('data', function(data) {
        console.error('[BuildTools]', data.toString().replace("\n",""));
    });

    // Broadcast when finished
    BuildToolsProc.on('exit', function() {
        cb();
    });
};

module.exports = buildtools;