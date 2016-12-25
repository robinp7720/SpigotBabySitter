var jenkinsapi = require('jenkins-api');
var request = require('request');
var fs = require('fs');
var async = require("async");

var JenkinsPluginManager = {
    "install": function (url, name, version, pluginPath, cb) {
        var plugins = require("../configs/plugins.json");
        var install = true;

        // Search in plugins list if plugin is already in list
        for (var i in plugins) {
            var plugin = plugins[i];
            if (plugin.source == "jenkins" && plugin.repo == url && plugin.job == name) {
                install = false;
                console.log("Plugin is already installed");
                break;
            }
        }

        // If plugin was not found in plugins list, add it
        if (install) {
            plugins.push(
                {
                    "source": "jenkins",
                    "repo": url,
                    "job": name,
                    "timestamp": 0
                }
            );

            // Write new file
            fs.writeFile(__dirname + "/../configs/plugins.json", JSON.stringify(plugins), function (err) {
                if (err) {
                    cb();
                    return console.log(err);
                }

                console.log("Plugin added to plugin list");

                JenkinsPluginManager.download(url, name, version, pluginPath, cb);
            });
        }
    },
    "download": function (url, name, version, pluginPath, cb) {
        var jenkins = jenkinsapi.init(url);

        // Get latest build from Jenkins
        jenkins.last_build_info(name, function (err, data) {
            if (err) {
                cb();

                // If error then stop and report to user
                return console.log(err);
            }


            // Find plugin in plugins list to update version number
            var plugins = require("../configs/plugins.json");
            for (var i in plugins) {
                var plugin = plugins[i];
                if (plugin.source == "jenkins" && plugin.repo == url && plugin.job == name) {
                    if (data.timestamp != plugin.timestamp) {
                        console.log("Update found for "+data['fullDisplayName'])
                    } else {
                        console.log("No update found for "+data['fullDisplayName']);
                        cb();
                        return false;
                    }
                    plugins[i].timestamp = data.timestamp;
                    break;
                }
            }
            // Write to file
            fs.writeFile(__dirname + "/../configs/plugins.json", JSON.stringify(plugins), function() {
                console.log("New version written to config file")
            });


            // Loop through all build artifacts and attempt to find the actual plugin
            async.eachSeries(data['artifacts'], function iteratee(item, callback) {
                if (item["fileName"].indexOf('sources') == -1 &&
                    item["fileName"].indexOf('javadoc') == -1 &&
                    item["fileName"].indexOf('original') == -1) {
                    // Generate the download url based on the artifacts url, job name and base url
                    var downloadUrl = url + "/job/" + name + "/lastBuild/artifact/" + item['relativePath'];
                    console.log("Downloading " + item["fileName"] + " from " + downloadUrl);
                    // Download file and pipe to plugins folder
                    request(downloadUrl, function () {
                        console.log("Downloaded " + item["fileName"] + " from " + downloadUrl);
                        console.log("Saved to " + pluginPath + item["fileName"]);
                        callback();
                    }).pipe(fs.createWriteStream(pluginPath + item["fileName"]));
                } else {
                    callback();
                }
            },function() {
                cb();
            });
        });
    }
};


module.exports = JenkinsPluginManager;