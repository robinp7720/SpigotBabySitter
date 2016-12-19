var restify = require('restify');
var fs = require('fs');
var async = require('async');
var CookieParser = require('restify-cookies');
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

// Start the server preflight

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

var server = restify.createServer();

server.use(restify.acceptParser(server.acceptable));
server.use(restify.bodyParser());
server.use(restify.gzipResponse());
server.use(restify.authorizationParser());


server.use(function (req, res, next) {
    var users;
    users = config.rest.authentication;

    // Ensure that user is not anonymous; and
    // That user exists; and
    // That user password matches the record in the database.
    if (req.username == 'anonymous' || !users[req.username] || req.authorization.basic.password !== users[req.username].password) {
        next(new restify.NotAuthorizedError());
    } else {
        next();
    }

    next();
});


server.put('/status/start', function(req,res,next) {
    if (MinecraftServer.proc == null) {
        startServer(function () {
            res.send("success");
            return next();
        });
    } else {
        res.send("Server already running");
        return next();
    }
});

server.put('/status/stop', function(req,res,next) {
    MinecraftServer.once('stop', function() {
        res.send("success");
        return next();
    });
    MinecraftServer.stop();
});

server.put('/status/restart', function(req,res,next) {
    MinecraftServer.stop(function() {
        if (!config.minecraftserv.AutoRestart) {
            startServer(function () {
                res.send("Server restarted");
                return next();
            });
        } else {
            res.send("Server stopped");
        }
    });
});


server.post('/console/execute', function(req,res,next) {
    MinecraftServer.exec(req.params.command);
    res.send('success');
});


server.post("/",function(req,res,next) {
    return next();
});


server.listen(config.rest.server.port, function() {
    console.log('Cyanmin listening at %s', server.url);
});