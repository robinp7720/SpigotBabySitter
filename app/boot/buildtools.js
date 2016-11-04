var async = require('async');
var BuildTools = require('../../buildtools-integration/buildtools.js');
var config  = require('../../configs/development.json');
var fs = require('fs');

module.exports = {
    compileServer: function (callback) {
        async.series([
            function (callback) {
                console.log("Downloading latest buildtools");
                BuildTools.download(config.buildtools.path, config.buildtools.FileName, function () {
                    console.log("BuildTools has been downloaded");
                    callback();
                });
            },
            function (callback) {
                BuildTools.compile(config.buildtools.path, config.buildtools.FileName, function () {
                    console.log("Server has been compiled");

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