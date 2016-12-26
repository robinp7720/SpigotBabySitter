var request = require('request');
var fs = require('fs');
var async = require('async');

var config  = require('../configs/config.json');

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

buildtools.run = function (cb) {
    async.series([
        function (callback) {
            console.log("Downloading latest buildtools".notification);
            buildtools.download(config.buildtools.path, config.buildtools.FileName, function () {
                console.log("BuildTools has been downloaded".notification);
                callback();
            });
        },
        function (callback) {
            buildtools.compile(config.buildtools.path, config.buildtools.FileName, "latest", function () {
                console.log("Server has been compiled".notification);

                fs.readdir(config.buildtools.path, function (err, files) {
                    var fileName = files.find(function(element){
                        return element.indexOf("spigot") !== -1;
                    });
                    fs.createReadStream(config.buildtools.path + fileName).pipe(fs.createWriteStream(config.minecraftserv.path + config.minecraftserv.FileName));
                    console.log();
                    callback();
                });

            });
        }
    ], cb);
}

module.exports = buildtools;