var Hapi = require('hapi');
var options = require('../config.json');
var request = require('request');
var _ = require('underscore');
var metricsProcessor = require('./metrics/metricsProcessor');
var StatsD = require('node-statsd').StatsD;

var server = Hapi.createServer(options.numpire.host, options.numpire.port);

var statsdClient;

if (options.numpire.isSelfTracking === true) {
	statsdClient = new StatsD({host:options.numpire.selfTracking.statsd.host, port: options.numpire.selfTracking.statsd.port, prefix: options.numpire.selfTracking.statsd.prefix});
} else {
	statsdClient = {};
	statsdClient.increment = function(){};
}

var check = {
	handler: function(request) {
		metricsProcessor.gatherAndJudge(options.graphite, request.query.metric, request.query.range, request.query.min, request.query.max, function(err, isOk) {
				if (isOk) {
					request.reply('ok');
					statsdClient.increment(request.query.metric + ".ok");
				} else {
					request.reply(Hapi.Error.internal('The data returned from graphite was outside of the specified criteria.'));
					statsdClient.increment(request.query.metric + ".not");
				}
		});
	},
	validate: {
        query: {
            metric: Hapi.Types.String().required(),
            range: Hapi.Types.Number().required(),
            min: Hapi.Types.Number(),
            max: Hapi.Types.Number()
        }
    }
};

var health = {
	handler: function(request) {
		request.reply({
			health: 'ok'
		});
	}
};

server.route({
	method: 'GET',
	path: '/check',
	config: check
});
server.route({
	method: 'GET',
	path: '/health',
	config: health
});

server.start();