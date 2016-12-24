var jenkinsapi = require('jenkins-api');
var request = require('request');
var fs = require('fs');

var JenkinsPluginManager = {
    "install": function (url, name, version, pluginPath) {
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
                    "job": name
                }
            );

            // Write new file
            fs.writeFile(__dirname + "/../configs/plugins.json", JSON.stringify(plugins), function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("Plugin added to plugin list");
            });

            this.download(url, name, version, pluginPath);
        }
    },
    "download": function (url, name, version, pluginPath) {
        var jenkins = jenkinsapi.init(url);

        // Get latest build from Jenkins
        jenkins.last_build_info(name, function (err, data) {
            if (err) {
                // If error then stop and report to user
                return console.log(err);
            }
            // Loop through all build artifacts and attempt to find the actual plugin
            for (var item in data['artifacts']) {
                item = data['artifacts'][item];
                // If the artifact name includes either sources or javadocs, assume that it is not the plugin jar
                if (item["fileName"].indexOf('sources') == -1 && item["fileName"].indexOf('javadoc') == -1) {
                    // Generate the download url based on the artifacts url, job name and base url
                    var downloadUrl = url + "/job/" + name + "/lastBuild/artifact/" + item['relativePath'];
                    console.log("Downloading " + item["fileName"] + " from " + downloadUrl);
                    // Download file and pipe to plugins folder
                    request(downloadUrl, function () {
                        console.log("Downloaded " + item["fileName"] + " from " + downloadUrl);
                        console.log("Saved to " + pluginPath + item["fileName"]);
                    }).pipe(fs.createWriteStream(pluginPath + item["fileName"]));
                }
            }
        });
    }
};


module.exports = JenkinsPluginManager;