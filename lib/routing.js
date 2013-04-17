var Hapi = require('hapi');
var options = require('../config.json');
var request = require('request');
var _ = require('underscore');
var metricsProcessor = require('./metrics/metricsProcessor');

var server = Hapi.createServer(options.numpire.host, options.numpire.port);

var check = {
	handler: function(request) {
		console.log(request.query.metric);
		metricsProcessor.gatherAndJudge(options.graphite, request.query.metric, request.query.range, request.query.min, request.query.max, function(err, isOk) {
				console.log('isOk', isOk);
				if (isOk) {
					request.reply('ok');
				} else {
					request.reply(Hapi.Error.internal('The data returned from graphite was outside of the specified criteria.'));
				}
		});
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