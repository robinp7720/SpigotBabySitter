var fs = require('fs');
var async = require('async');
var crypto = require('crypto');

var config = require('./configs/development.json');

var MinecraftServer = require('./minecraftserver-integration/server.js');

process.stdin.setEncoding('utf8');

function startServer(callback) {
    console.log();
    console.log("Starting server");
    console.log('---------------------------------');

    MinecraftServer.start();

    MinecraftServer.onLog(function (data) {
        console.log(data.toString().replace("\n", ""));
    });

    if (callback != undefined)
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

    MinecraftServer.on('start', function () {
        console.log("Server has been started successfully")
    });

    MinecraftServer.on("stop", function () {

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
    function (callback) {
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
    function (callback) {
        console.log('---------------------------------');
        console.log("Server preflight finished");
        callback()
    },
    function (callback) {
        if (config.minecraftserv.AutoStart) {
            startServer(callback)
        } else {
            callback();
        }
    }
]);

var wrapperCommands = {
    "stopwrapper": function () {
        config.minecraftserv.AutoRestart = false;
        MinecraftServer.stop(function () {
                console.log("Killing wrapper now");
                process.kill(process.pid);
            }
        );
    },
    "enablerestart": function () {
        config.minecraftserv.AutoRestart = true;
    },
    "disablerestart": function () {
        config.minecraftserv.AutoRestart = false;
    },
    "stop": function () {
        MinecraftServer.stop();
    },
    "start": function () {
        startServer();
    },
    "restart": function () {
        if (config.minecraftserv.AutoRestart == false) {
            startServer(function () {
                console.log("Server has been restarted")
            });
        }
    },
    "update": function() {
        require('./app/boot/buildtools.js').compileServer(function() {
            console.log("Sever has been updated");
        });
    }
};

process.stdin.on('readable', function () {
    var chunk = process.stdin.read();
    if (chunk !== null) {
        if (chunk.substring(0, 1) == "!") {
            // Remove newline char and ! from input
            var length = chunk.length - 1;
            var command = chunk.substring(1, length);

            // Execute command
            if (wrapperCommands[command])
                wrapperCommands[command]();
        } else {
            // If command does not include a ! as the first character, consider it as a minecraft server command
            MinecraftServer.exec(chunk);
        }
    }
});
