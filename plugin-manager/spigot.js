var request = require('request');
var fs = require('fs');

var SpigotPluginManager = {
    "install": function (id, pluginPath) {
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
                            "name": plugin["name"]
                        }
                    );

                    // Write new file
                    fs.writeFile(__dirname + "/../configs/plugins.json", JSON.stringify(plugins), function (err) {
                        if (err) {
                            return console.log(err);
                        }
                        console.log("Plugin added to plugin list");

                        SpigotPluginManager.download(id, pluginPath);
                    });
                }
            } else {
                if (plugin['name'] == undefined){
                    console.log("Plugin not found");
                } else {
                    console.log(plugin['name'] + " uses an external source. It cannot be downloaded")
                }
            }
        });
    },
    "download": function (id, pluginPath) {
        // Get information about plugin and if it's possible to download and install it
        request("https://api.spiget.org/v2/resources/"+id, function(error, response, body) {
            var plugin = JSON.parse(body);
            if (plugin[0] != undefined) {
                plugin = plugin[0];
            }
            if (plugin['external'] == false) {
                var downloadUrl = "https://www.spigotmc.org/" + plugin.file.url;
                console.log("Downloading " + downloadUrl);
                request(downloadUrl, function () {
                    console.log("Downloaded " + plugin['name'] + " from " + downloadUrl);
                    console.log("Saved to " + pluginPath + plugin['name']+".jar");
                }).pipe(fs.createWriteStream(pluginPath + plugin['name']+".jar"));
            } else {
                if (plugin['name'] == undefined){
                    console.log("Plugin not found");
                } else {
                    console.log(plugin['name'] + " uses an external source. It cannot be downloaded")
                }
            }
        });
    }
};

module.exports = SpigotPluginManager;