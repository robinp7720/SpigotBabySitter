var request = require('request');
var fs = require('fs');

var config  = require('../configs/development.json');

// Allow for color coded output
var colors = require('colors');

// Set color theme
colors.setTheme(config.colors);

var spawn = require('child_process').spawn;

var buildtools = {};

/**
 * @param cwd Working Directory
 * @param filename Filename to name download
 * @param cb Run when downloaded
 */
buildtools.download = function(cwd,filename,cb) {
    request('https://hub.spigotmc.org/jenkins/job/BuildTools/lastSuccessfulBuild/artifact/target/BuildTools.jar', cb).pipe(fs.createWriteStream(cwd+filename))
};

/**
 *
 * @param cwd Working directory of BuiltTools
 * @param filename Filename of buildtools jar
 * @param version Minecraft version to build spigot for
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
        var log = data.toString().replace("\n","");
        if (log.indexOf("WARN") > -1)
            log = log.warn;
        console.log('[BuildTools]'.buildtools, log);
    });

    // Log stderr
    BuildToolsProc.stderr.on('data', function(data) {
        console.error('[BuildTools]'.buildtools, data.toString().replace("\n","").error);
    });

    // Broadcast when finished
    BuildToolsProc.on('exit', cb);
};

module.exports = buildtools;