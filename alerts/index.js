
var alerts = {
    "services": [],
    "config": {},

    "enableService": function(service) {
        var MODULE = new require("./services/"+service);
        MODULE.loadConfig = this.config.alerts[service];
        this.services.push(MODULE);
    },

    "enableServices": function(services) {
        for (var i in services) {
            var MODULE = services[i];
            this.enableService(MODULE);
        }
    },

    "start": function() {

    }
};

module.exports = alerts;