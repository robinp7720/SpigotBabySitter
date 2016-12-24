var fs = require('fs');
var async = require('async');
var crypto = require('crypto');

var config = require('./configs/development.json');

var MinecraftServer = require('./minecraftserver-integration/server.js');

// This line make nodejs not verify ssl certs. I have experienced issues with some jenkins servers which use Lets Encrypt certs which aren't supported by NodeJS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


// Set encoding type of inputs
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
    "stopwrapper": function (args) {
        config.minecraftserv.AutoRestart = false;
        MinecraftServer.stop(function () {
                console.log("Killing wrapper now");
                process.kill(process.pid);
            }
        );
    },
    "set": function(args) {
        if (args[2] == "True") {
            args[2] = true;
        } else if (args[2] == "False") {
            args[2] = false;
        }
        config.minecraftserv[args[1]] = args[2];
    },
    "stop": function (args) {
        MinecraftServer.stop();
    },
    "start": function (args) {
        startServer();
    },
    "restart": function (args) {
        if (config.minecraftserv.AutoRestart == false) {
            startServer(function () {
                console.log("Server has been restarted")
            });
        }
    },
    "recompile": function(args) {
        require('./app/boot/buildtools.js').compileServer(function() {
            console.log("Sever has been updated");
        });
    },
    "install": function(args) {
        var source = args[1];
        if (source == "jenkins") {
            var JenkinsPluginManager = require('./plugin-manager/jenkins');
            JenkinsPluginManager.install(args[2],args[3],null,config.minecraftserv.path+config.minecraftserv.pluginsDir);
        }
    },
    "plugins": function(args) {
        var plugins = require("./configs/plugins.json");

        if (args[1] == "list") {
            for (i in plugins) {
                var plugin = plugins[i];
                console.log(plugin);
            }
        } else if (args[1] == "update") {
            for (i in plugins) {
                var plugin = plugins[i];
                if (plugin.source == "jenkins") {
                    var JenkinsPluginManager = require('./plugin-manager/jenkins');
                    JenkinsPluginManager.download(plugin.repo, plugin.job, null, config.minecraftserv.path + config.minecraftserv.pluginsDir);
                }
            }
        }
    }
};

process.stdin.on('readable', function () {
    var chunk = process.stdin.read();
    if (chunk !== null) {
        if (chunk.substring(0, 1) == "!") {
            // Remove newline char and ! from input
            var length = chunk.length - 1;
            var command = chunk.substring(1, length).split(' ');

            // Execute command
            if (wrapperCommands[command[0]])
                wrapperCommands[command[0]](command);
        } else {
            // If command does not include a ! as the first character, consider it as a minecraft server command
            MinecraftServer.exec(chunk);
        }
    }
});
