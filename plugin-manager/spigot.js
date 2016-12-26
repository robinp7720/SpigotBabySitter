var request = require('request');
var cloudscraper = require('cloudscraper');
var fs = require('fs');

var SpigotPluginManager = {
    "install": function (id, pluginPath,cb) {
        var plugins = require("../configs/plugins.json");
        var install = true;

        // Get plugin information via Spiget
        request("https://api.spiget.org/v2/resources/"+id, function(error, response, body) {
            var plugin = JSON.parse(body);
            if (plugin[0] != undefined) {
                plugin = plugin[0];
            }
            if (plugin['external'] == false) {
                // Search in plugins list if plugin is already in list
                for (var i in plugins) {
                    var pluginEntry = plugins[i];
                    if (pluginEntry.source == "spigot" && pluginEntry.id == plugin["id"]) {
                        install = false;
                        console.log("Plugin is already installed");
                        break;
                    }
                }

                // If plugin was not found in plugins list, add it
                if (install) {
                    console.log("Installing "+plugin['name']);
                    plugins.push(
                        {
                            "source": "spigot",
                            "id": plugin["id"],
                            "name": plugin["name"],
                            "version": 0
                        }
                    );

                    // Write new file
                    fs.writeFile(__dirname + "/../configs/plugins.json", JSON.stringify(plugins), function (err) {
                        if (err) {
                            cb();
                            return console.log(err);
                        }
                        console.log("Plugin added to plugin list");

                        SpigotPluginManager.download(id, pluginPath,cb);
                    });
                }
            } else {
                if (plugin['name'] == undefined){
                    console.log("Plugin not found");
                } else {
                    console.log(plugin['name'] + " uses an external source. It cannot be downloaded")
                }
                cb(true);
            }
        });
    },
    "download": function (id, pluginPath,cb) {
        // Get information about plugin and if it's possible to download and install it
        request("https://api.spiget.org/v2/resources/"+id, function(error, response, body) {
            var plugin = JSON.parse(body);
            if (plugin[0] != undefined) {
                plugin = plugin[0];
            }

            var pluginList = require("../configs/plugins.json");
            for (var i in pluginList) {
                var pluginEntry = pluginList[i];
                if (pluginEntry.source == "spigot" && pluginEntry.id == plugin["id"]) {
                    if (plugin.version.id != pluginEntry.version) {
                        console.log("Update found for "+plugin['name'])
                    } else {
                        console.log("No update found for "+plugin['name']);
                        cb();
                        return false;
                    }
                    pluginList[i].version = plugin.version.id;
                    break;
                }
            }
            // Write to file
            fs.writeFile(__dirname + "/../configs/plugins.json", JSON.stringify(pluginList), function() {

            });

            if (plugin['external'] == false) {
                var downloadUrl = "https://www.spigotmc.org/" + plugin.file.url;
                console.log("Downloading " + downloadUrl);
                cloudscraper.request({method: 'GET',
                    url: downloadUrl,
                    encoding: null
                }, function(err, response, body) {
                    if (error) {
                        cb();
                        return console.log('Error occurred');
                    } else {
                        console.log("Downloaded " + plugin['name'] + " from " + downloadUrl);
                        var wstream = fs.createWriteStream(pluginPath + plugin['name']+".jar");
                        wstream.write(body);
                        wstream.end();
                        console.log("Saved to " + pluginPath + plugin['name']+".jar");
                        cb();
                    }
                });
            } else {
                if (plugin['name'] == undefined){
                    console.log("Plugin not found");
                } else {
                    console.log(plugin['name'] + " uses an external source. It cannot be downloaded")
                }
                cb(true);
            }
        });
    }
};

module.exports = SpigotPluginManager;