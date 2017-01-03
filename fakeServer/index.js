var mc = require('minecraft-protocol');

var fakeServer = {};

fakeServer.server = null;

fakeServer.maxPlayers = 20;
fakeServer.gameMode = 1;
fakeServer.dimension = 1;
fakeServer.difficulty = 0;

fakeServer.host = "0.0.0.0";
fakeServer.port = 25565;

fakeServer.version = "1.11.2";


fakeServer.joinMessage = "Running SpigotBabySitter temp server right now";

fakeServer.start = function() {
    var _this = this;
    this.server = mc.createServer({
        'online-mode': true,   // optional
        encryption: true,      // optional
        host: _this.host,       // optional
        port: _this.port,           // optional
        version: _this.version,
        maxPlayers: _this.maxPlayers
    });

    this.server.on('login', function(client) {
        client.write('login', {
            entityId: client.id,
            levelType: 'default',
            gameMode: _this.gameMode,
            dimension: _this.dimension,
            difficulty: _this.difficulty,
            maxPlayers: _this.server.maxPlayers,
            reducedDebugInfo: true
        });
        client.write('position', {
            x: 0,
            y: 255,
            z: 0,
            yaw: 0,
            pitch: 0,
            flags: 0x00
        });
        var msg = {
            translate: 'chat.type.announcement',
            "with": [
                'Server',
                _this.joinMessage
            ]
        };
        client.write("chat", { message: JSON.stringify(msg), position: 0 });
    });
};

fakeServer.stop = function(cb) {
    this.server.close();
    if (cb)
        cb()
};

module.exports = fakeServer;