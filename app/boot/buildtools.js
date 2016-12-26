var async = require('async');
var BuildTools = require('../../buildtools-integration/buildtools.js');
var config  = require('../../configs/config.json');
var fs = require('fs');

// Allow for color coded output
var colors = require('colors');

// Set color theme
colors.setTheme(config.colors);


module.exports = {
    compileServer: function (callback) {
        async.series([
            function (callback) {
                console.log("Downloading latest buildtools".notification);
                BuildTools.download(config.buildtools.path, config.buildtools.FileName, function () {
                    console.log("BuildTools has been downloaded".notification);
                    callback();
                });
            },
            function (callback) {
                BuildTools.compile(config.buildtools.path, config.buildtools.FileName, function () {
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
        ], callback);
    }
};