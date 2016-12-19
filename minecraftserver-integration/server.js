var events = require('events');

var spawn = require('child_process').spawn;


var eventEmitter = new events.EventEmitter();

var server = {};

server.proc = null;

server.path = "files/MinecraftServer/";
server.FileName = "server.jar";

server.worldsDir = "../worlds/";
server.pluginsDir = "../plugins/";
server.configDirectory = "../settings/";


server.start = function() {
    server.proc = spawn('java', [
        '-Dcom.mojang.eula.agree=true',
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

    server.proc.on('exit', function() {
        server.proc = null;
        eventEmitter.emit('stop');
    });

    eventEmitter.emit('start');
};

server.stop = function(cb) {
    server.proc.stdin.write('stop\n');
    if (cb != undefined) {
        eventEmitter.once("stop", cb);
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
    server.proc.stdin.write(cmd + '\n');
};


module.exports = server;