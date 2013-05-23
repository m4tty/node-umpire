var Hapi = require('hapi');
var options = require('../config.json');
var _ = require('underscore');
var metricsProcessor = require('./metrics/metricsProcessor');
var StatsD = require('node-statsd').StatsD;

var server = Hapi.createServer(options.numpire.host, options.numpire.port);
var statsdClient;

if (options.numpire.isSelfTracking === true) {
	statsdClient = new StatsD({
		host: options.numpire.selfTracking.statsd.host,
		port: options.numpire.selfTracking.statsd.port,
		prefix: options.numpire.selfTracking.statsd.prefix
	});
} else {
	statsdClient = {};
	statsdClient.increment = function() {};
}

var check = {
	handler: function(req) {
		console.log(req.query.metric);
		metricsProcessor.gatherAndJudge(options.graphite, req.query.metric, req.query.range, req.query.min, req.query.max, function(err, isOk) {
			if (err) {
				return req.reply(Hapi.Error.internal('There was a problem getting the data from graphite.'));
			}

			if (isOk === true) {
				req.reply('ok');
				statsdClient.increment(req.query.metric + ".ok");
			} else {
				req.reply(Hapi.Error.internal('The data returned from graphite was outside of the specified criteria.'));
				statsdClient.increment(req.query.metric + ".not");
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
	handler: function(req) {
		req.reply({
			health: 'ok'
		});
	}
};

server.on('internalError', function(req, err) {
	console.log('Error response (500) sent for request: ' + req.id + ' : ' + req.path + req.url.search + ' because: ' + err.message);
});

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
