var EasyZip = require('easy-zip').EasyZip;
var async = require('async');
var path = require('path');

var backupManager = {
    "pluginsDir": "../files/plugins",
    "worldsDir": "../files/worlds",
    "settingsDir": "../files/settings",
    "serverDir": "../files/MinecraftServer",
    "backupDir": "../files/backups",

    "defaultItems": ["worlds","plugins","settings","server"],

    "setConfig": function(config) {
        this.serverDir = path.normalize(config.minecraftserv.path);
        this.pluginsDir = path.normalize(this.serverDir + config.minecraftserv.pluginsDir);
        this.worldsDir = path.normalize(this.serverDir + config.minecraftserv.worldsDir);
        this.settingsDir = path.normalize(this.serverDir + config.minecraftserv.configDirectory);
        this.backupDir = path.normalize(config.minecraftserv.backupDir);

        this.defaultItems = config.backup.defaultItems;
    },

    "backup": function(items,cb) {
        if (items.length == 0) {
            items = this.defaultItems;
        }

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