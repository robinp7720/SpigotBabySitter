var fs = require('fs');
var async = require('async');
var crypto = require('crypto');
var moment = require('moment');

var config = require('./configs/config.json');

// Load integration for BuildTools and Spigot
var buildtools = require('./buildtools-integration/buildtools.js');
var MinecraftServer = require('./minecraftserver-integration/server.js');

// Load alerts system
var alerts = require('./alerts/index');

// Allow for color coded output
var colors = require('colors');


// Load fakeServer module to allow for notifications/alerts to players when server is down.
var fakeServer = require('./fakeServer/index');

// Set color theme
colors.setTheme(config.colors);

// This line make nodejs not verify ssl certs. I have experienced issues with some jenkins servers which use Lets Encrypt certs which aren't supported by NodeJS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Set encoding type of inputs
process.stdin.setEncoding('utf8');

function startServer(cb) {
    if (MinecraftServer.proc == null) {
        console.log();
        console.log("Starting server".notification);
        console.log('---------------------------------'.notification);

        MinecraftServer.start();

        MinecraftServer.onLog(function (data) {
            var log = data.toString().replace("\n", "");
            if (log.indexOf("WARN") > -1)
                log = log.warn;
            if (log.indexOf("ERROR") > -1)
                log = log.error;
            console.log(log);
        });
        MinecraftServer.onErr(function (data) {
            console.log(data.toString().replace("\n", "").error);
        });

        if (cb !== undefined)
            cb();
    }
    else {
        console.log("Server already running".error);
        cb();
    }
}

function startFakeServer() {
    fakeServer.maxPlayers = config.minecraftserv.maxPlayers;
    fakeServer.host = config.minecraftserv.host;
    fakeServer.port = config.minecraftserv.port;

    fakeServer.dimension = config.fakeServer.dimension;
    fakeServer.gameMode = config.fakeServer.gameMode;
    fakeServer.difficulty = config.fakeServer.difficulty;

    fakeServer.joinMessage = config.fakeServer.joinMessage;
    fakeServer.motd = config.fakeServer.motd;

    console.log();
    console.log("Starting fake server".notification);
    console.log('---------------------------------'.notification);
    fakeServer.start();
}

function stopFakeServer() {
    console.log("stopping fake server".notification);
    console.log('---------------------------------'.notification);
    fakeServer.stop();
}

function setupMinecraftServer(callback) {

    console.log("Setting up server wrapper".notification);

    // Setup minecraft server
    // Set all directories where minecraft server files will be stored
    MinecraftServer.path = config.minecraftserv.path;
    MinecraftServer.FileName = config.minecraftserv.FileName;
    MinecraftServer.pluginsDir = config.minecraftserv.pluginsDir;           // This path is relative to server jar path
    MinecraftServer.worldsDir = config.minecraftserv.worldsDir;             // This path is relative to server jar path
    MinecraftServer.configDirectory = config.minecraftserv.configDirectory; // This path is relative to server jar path

    // Set ram options
    MinecraftServer.maxRam = config.minecraftserv.maxRam;
    MinecraftServer.minRam = config.minecraftserv.minRam;

    // Set network options
    MinecraftServer.host = config.minecraftserv.host;
    MinecraftServer.port = config.minecraftserv.port;

    MinecraftServer.maxPlayers = config.minecraftserv.maxPlayers;

    MinecraftServer.on('start', function () {
        stopFakeServer();
        console.log("Server has been started successfully".notification)
    });

    MinecraftServer.on("stop", function () {

        // Print to console that the server has been stopped
        console.log("Server has been stopped successfully".notification);

        // If auto restart is enabled, restart the server
        if (config.minecraftserv.AutoRestart) {
            startServer(function () {
                console.log("Server started automatically".notification)
            });
        }

        if (config.fakeServer.autoStart) {
            startFakeServer();
        }
    });

    callback();
}


function startScheduler(id) {
    console.log("Starting scheduler ".notification+id.notification);
    var item = config.schedule[id];
    setInterval(function() {
        var actions = item.actions;
        runScriptSeries(actions)

    },item.every*1000);
}

function startAllSchedulers(cb) {
// Setup scheduler
    for (var i in config.schedule) {
        startScheduler(i);
    }
    cb();
}

function UpdatePlugins(cb) {
    var plugins = require("./configs/plugins.json");
    async.eachSeries(plugins, function iteratee(plugin, callback) {
        if (plugin.source == "jenkins") {
            var JenkinsPluginManager = require('./plugin-manager/jenkins');
            JenkinsPluginManager.download(plugin.repo, plugin.job, null, config.minecraftserv.path + config.minecraftserv.pluginsDir,callback);
        }
        if (plugin.source == "spigot") {
            var SpigotPluginManager = require('./plugin-manager/spigot');
            SpigotPluginManager.download(plugin.id,config.minecraftserv.path+config.minecraftserv.pluginsDir,callback);
        }
    },function() {
        cb();
    });
}

// Start the server startup sequence

async.series([
    function (callback) {
        console.log("Setting up server".notification);
        console.log('---------------------------------'.notification);

        // Download and run buildtools
        if (config.buildtools.run) {
            buildtools.run(callback)
        } else {
            console.log("Skipping buildtools as it is turned off in config".notification);
            callback();
        }
    },
    function(callback) {
        // Start alerts system
        alerts.config = config;
        alerts.enableServices(config.alerts.services);
        alerts.start();
        callback();
    },
    setupMinecraftServer,
    startAllSchedulers,
    function (callback) {
        console.log('---------------------------------'.notification);
        console.log("Server preflight finished".notification);
        callback()
    },
    function (callback) {
        if (config.minecraftserv.AutoStart) {
            startServer(callback)
        } else {
            if (config.fakeServer.autoStart) {
                startFakeServer();
            }
            callback();
        }
    }
]);

// Define commands available for use
var wrapperCommands = {
    "stopwrapper": function (args) {
        config.minecraftserv.AutoRestart = false;
        MinecraftServer.stop(function () {
                console.log("Killing wrapper now".notification);
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
        MinecraftServer.stop(function() {
            if (config.minecraftserv.AutoRestart == false) {
                startServer(function () {
                    console.log("Server has been restarted".notification)
                });
            }
        });
    },
    "recompile": function(args) {
        buildtools.run(function() {
            console.log("Sever has been updated".notification);
        });
    },
    "install": function(args) {
        var source = args[1];
        if (source == "jenkins") {
            var JenkinsPluginManager = require('./plugin-manager/jenkins');
            JenkinsPluginManager.install(args[2],args[3],null,config.minecraftserv.path+config.minecraftserv.pluginsDir, function(err) {
                if (err) {
                    console.log("Plugin installation failed".error)
                }
                console.log("Plugin installed!".notification)
            });
        } else if (source == "spigot") {
            var SpigotPluginManager = require('./plugin-manager/spigot');
            SpigotPluginManager.install(args[2],config.minecraftserv.path+config.minecraftserv.pluginsDir, function(err,test) {
                if (err) {
                    return console.log("Plugin installation failed".error)
                }
                console.log("Plugin installed!".notification)
            });
        }
    },
    "plugins": function(args) {
        if (args[1] == "list") {
            var plugins = require("./configs/plugins.json");
            for (var i in plugins) {
                var plugin = plugins[i];
                if (plugin.source == "jenkins") {
                    var formatted = moment( plugin.timestamp ).format("Y/M/D hh:MM:ss");
                    console.log(plugin.job.blue + " from ".blue +plugin.repo.red + " Build time: ".blue + formatted);
                } else {
                    console.log(plugin.name.blue + " from ".blue +plugin.source.red + " Version: ".blue + plugin.version);
                }
            }
        } else if (args[1] == "update") {
            UpdatePlugins(function() {
                console.log("Plugin update finished".notification);
            })
        }
    },
    "backup": function(args) {
        var backup = require('./backup-manager/index');
        backup.setConfig(config);
        args.shift(); // Remove first items from array as this is the command.
        backup.backup(args);
    }

};


// Listen for input on stdin
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

function runScriptSeries(script,cb) {
    var AutoRestart = config.minecraftserv.AutoRestart;
    async.eachSeries(script, function iteratee(action, callback) {
        var ActionType = action.action;

        if (ActionType == "start") {
            config.minecraftserv.AutoRestart = AutoRestart;
            startServer(callback);
        }
        else if (ActionType == "stop") {
            config.minecraftserv.AutoRestart = false;
            MinecraftServer.stop(callback);
        }
        else if (ActionType == "updatePlugins") {
            UpdatePlugins(callback);
        }
        else if (ActionType == "command") {
            MinecraftServer.exec(action.command);
            if (action.wait) {
                setTimeout(function () {
                    callback()
                }, action.wait * 1000);
            } else {
                callback();
            }
        }
        else if (ActionType == "backup") {
            var backup = require('./backup-manager/index');
            backup.setConfig(config);
            backup.backup(action.items,callback);
        }
        else if (ActionType == "recompile") {
            buildtools.run(function() {
                callback();
            });
        }
        else {
            setTimeout(function () {
                callback()
            }, 1000);
        }
    },function() {
        if (cb)
            cb();
    });
}
