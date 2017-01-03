var events = require('events');

var spawn = require('child_process').spawn;


var eventEmitter = new events.EventEmitter();

var server = {};

server.proc = null;

server.path = "files/MinecraftServer/";
server.FileName = "server.jar";

server.maxRam = "1G";
server.minRam = "1G";

server.host = "";
server.port = 25565;

server.maxPlayers = 20;

server.worldsDir = "../worlds/";
server.pluginsDir = "../plugins/";
server.configDirectory = "../settings/";


server.start = function(cb) {
    if (this.proc === null) {
        var _this = this;
        _this.proc = spawn('java', [
            '-Dcom.mojang.eula.agree=true',
            '-Xms' + _this.minRam,
            '-Xmx' + _this.maxRam,
            '-jar', _this.FileName,
            '--world-dir', _this.worldsDir,
            '--plugins', _this.pluginsDir,
            '--bukkit-settings', _this.configDirectory + "bukkit.yml",
            '--commands-settings', _this.configDirectory + "commands.yml",
            '--config', _this.configDirectory + "config.yml",
            '--spigot-settings', _this.configDirectory + "spigot.yml",
            '--host', _this.host,
            '--port', _this.port,
            '--max-players', _this.maxPlayers
        ], {
            cwd: _this.path
        });

        _this.proc.on('exit', function () {
            _this.proc = null;
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
    var _this = this;
    if (this.proc !== null) {
        server.proc.stdin.write('stop\n');
        if (cb !== undefined) {
            eventEmitter.once("stop", function() {
               _this.proc = null;
            });
            eventEmitter.once("stop", cb);
        }
    } else {
        console.log("Server is not running");
        if (cb !== undefined)
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
    this.proc.stdout.on('data', cb);
};
server.onErr = function(cb) {
    this.proc.stderr.on('data', cb);
};

server.exec = function(cmd) {
    if (this.proc != null) {
        server.proc.stdin.write(cmd + '\n');
    } else {
        console.log("Server is not running")
    }
};


module.exports = server;