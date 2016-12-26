var EasyZip = require('easy-zip').EasyZip;
var async = require('async');
var path = require('path');
var spawn = require('child_process').spawn;

var backupManager = {
    "pluginsDir": "../files/plugins",
    "worldsDir": "../files/worlds",
    "settingsDir": "../files/settings",
    "serverDir": "../files/MinecraftServer",
    "backupDir": "../files/backups",

    "defaultItems": ["worlds","plugins","settings","server"],
    "useTar": true,
    "compress": false,

    "setConfig": function(config) {
        this.serverDir = path.normalize(config.minecraftserv.path);
        this.pluginsDir = path.normalize(this.serverDir + config.minecraftserv.pluginsDir);
        this.worldsDir = path.normalize(this.serverDir + config.minecraftserv.worldsDir);
        this.settingsDir = path.normalize(this.serverDir + config.minecraftserv.configDirectory);
        this.backupDir = path.normalize(config.minecraftserv.backupDir);

        this.defaultItems = config.backup.defaultItems;
        this.useTar = config.backup.useTar;
        this.compress = config.backup.compress;
    },

    "backup": function(items,cb) {
        if (items.length == 0) {
            items = this.defaultItems;
        }

        if (this.useTar) {
            return this.tar(items,cb);
        }

        this.easyzip(items,cb);
    },

    "tar": function(items,cb) {
        async.eachSeries(items, function iteratee(item, callback) {
            console.log("Backing up "+item+"...");

            if (item == "plugins") {
                var fileName = backupManager.backupDir+"/plugins/"+new Date().getTime() + ".tar.gz";
                var path = backupManager.pluginsDir;
            }
            else if (item == "worlds") {
                var fileName = backupManager.backupDir+"/worlds/"+new Date().getTime() + ".tar.gz";
                var path = backupManager.worldsDir;
            }
            else if (item == "server") {
                var fileName = backupManager.backupDir+"/MinecraftServer/"+new Date().getTime() + ".tar.gz";
                var path = backupManager.serverDir;
            }
            else if (item == "settings") {
                var fileName = backupManager.backupDir+"/settings/"+new Date().getTime() + ".tar.gz";
                var path = backupManager.settingsDir;
            }
            var args = '-cf';
            if (this.compress) {
                args = '-czf';
            }

            var tarProc = spawn('tar', [
                args,
                fileName,
                path
            ]);

            tarProc.on('exit', function() {
                console.log("Backed "+item);
                callback();
            });
        },function() {
            console.log("Backup finished!");
            if (cb !== undefined)
                cb();
        });
    },

    "easyzip": function(items,cb) {
        async.eachSeries(items, function iteratee(item, callback) {
            var zip = new EasyZip();
            if (item == "plugins") {
                console.log("Backing up plugins...");
                zip.zipFolder(backupManager.pluginsDir, function () {
                    zip.writeToFile(backupManager.backupDir+"/plugins/"+new Date().getTime() + ".zip");
                    console.log("World backup finished");
                    callback();
                });
            }
            else if (item == "worlds") {
                console.log("Backing up worlds...");
                zip.zipFolder(backupManager.worldsDir, function () {
                    zip.writeToFile(backupManager.backupDir+"/worlds/"+new Date().getTime() + ".zip");
                    console.log("Worlds backup finished");
                    callback();
                });
            }
            else if (item == "server") {
                console.log("Backing up server...");
                zip.zipFolder(backupManager.serverDir, function () {
                    zip.writeToFile(backupManager.backupDir+"/MinecraftServer/"+new Date().getTime() + ".zip");
                    console.log("Server backup finished");
                    callback();
                });
            }
            else if (item == "settings") {
                console.log("Backing up settings...");
                zip.zipFolder(backupManager.settingsDir, function () {
                    zip.writeToFile(backupManager.backupDir+"/settings/"+new Date().getTime() + ".zip");
                    console.log("Settings backup finished");
                    callback();
                });
            }
        },function() {
            console.log("Backup finished!");
            if (cb !== undefined)
                cb();
        });
    }
};

module.exports = backupManager;