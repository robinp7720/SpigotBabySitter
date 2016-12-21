var fs = require('fs');
var async = require('async');
var crypto = require('crypto');

var config  = require('./configs/development.json');

var MinecraftServer = require('./minecraftserver-integration/server.js');

function startServer(callback) {
    console.log();
    console.log("Starting server");
    console.log('---------------------------------');

    MinecraftServer.start();

    MinecraftServer.onLog(function (data) {
        console.log(data.toString().replace("\n",""));
    });

    callback();
}

function setupMinecraftServer(callback) {

    console.log("Setting up server wrapper");

    // Setup minecraft server
    MinecraftServer.path = config.minecraftserv.path;
    MinecraftServer.FileName = config.minecraftserv.FileName;
    MinecraftServer.pluginsDir = config.minecraftserv.pluginsDir;
    MinecraftServer.worldsDir = config.minecraftserv.worldsDir;
    MinecraftServer.configDirectory = config.minecraftserv.configDirectory;
    MinecraftServer.maxRam = config.minecraftserv.maxRam;
    MinecraftServer.minRam = config.minecraftserv.minRam;

    MinecraftServer.on('start', function() {
        console.log("Server has been started successfully")
    });

    MinecraftServer.on("stop", function() {

        // Print to console that the server has been stopped
        console.log("Server has been stopped successfully");

        // If auto restart is enabled, restart the server
        if (config.minecraftserv.AutoRestart) {
            startServer(function () {
                console.log("Server started automatically")
            });
        }
    });

    callback();
}

// Start the server startup sequence

async.series([
    function(callback) {
        console.log("Setting up server");
        console.log('---------------------------------');

        // Download and run buildtools
        if (config.buildtools.run) {
            require('./app/boot/buildtools.js').compileServer(callback)
        } else {
            console.log("Skipping buildtools as it is turned off in config");
            callback();
        }
    },
    setupMinecraftServer,
    function(callback) {
        console.log('---------------------------------');
        console.log("Server preflight finished");
        callback()
    },
    function(callback) {
        if (config.minecraftserv.AutoStart) {
            startServer(callback)
        } else {
            callback();
        }
    }
]);
