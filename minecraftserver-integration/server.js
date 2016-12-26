var events = require('events');

var spawn = require('child_process').spawn;


var eventEmitter = new events.EventEmitter();

var server = {};

server.proc = null;

server.path = "files/MinecraftServer/";
server.FileName = "server.jar";

server.maxRam = "1G";
server.minRam = "1G";

server.worldsDir = "../worlds/";
server.pluginsDir = "../plugins/";
server.configDirectory = "../settings/";


server.start = function(cb) {
    if (server.proc == null) {
        server.proc = spawn('java', [
            '-Dcom.mojang.eula.agree=true',
            '-Xms' + server.minRam,
            '-Xmx' + server.maxRam,
            '-jar', server.FileName,
            '--world-dir', server.worldsDir,
            '--plugins', server.pluginsDir,
            '--bukkit-settings', server.configDirectory + "bukkit.yml",
            '--commands-settings', server.configDirectory + "commands.yml",
            '--config', server.configDirectory + "config.yml",
            '--spigot-settings', server.configDirectory + "spigot.yml"
        ], {
            cwd: server.path
        });

        server.proc.on('exit', function () {
            server.proc = null;
            eventEmitter.emit('stop');
        });

        eventEmitter.emit('start');
    } else {
        console.log("Server is already running");
    }
    if (cb !== undefined)
        cb();
};

server.stop = function(cb) {
    if (server.proc != null) {
        server.proc.stdin.write('stop\n');
        if (cb != undefined) {
            eventEmitter.once("stop", function() {
               server.proc = null;
            });
            eventEmitter.once("stop", cb);
        }
    } else {
        console.log("Server is not running");
        if (cb != undefined)
            cb();
    }
};

server.on = function(event, callback) {
    eventEmitter.on(event, callback);
};

server.once = function(event, callback) {
    eventEmitter.once(event, callback);
};


server.removeListener = function(event, handler) {
    eventEmitter.removeListener(event, handler);
};

server.onLog = function(cb) {
    server.proc.stdout.on('data', cb);
};
server.onErr = function(cb) {
    server.proc.stderr.on('data', cb);
};

server.exec = function(cmd) {
    if (server.proc != null) {
        server.proc.stdin.write(cmd + '\n');
    } else {
        console.log("Server is not running")
    }
};


module.exports = server;