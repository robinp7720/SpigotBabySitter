var events = require('events');

var spawn = require('child_process').spawn;


var eventEmitter = new events.EventEmitter();

var server = {};

server.proc = null;

server.path = "files/MinecraftServer/";
server.FileName = "server.jar";


server.start = function() {
    server.proc = spawn('java', [
        '-jar',
        server.FileName
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

server.onLog = function(cb){
    server.proc.stdout.on('data', cb);
};
server.onErr = function(cb){
    server.proc.stderr.on('data', cb);
};


module.exports = server;