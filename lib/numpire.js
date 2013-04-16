var Hapi = require('hapi');
var options = require('../config.json');
var request = require('request');
var _ = require('underscore');

var server = Hapi.createServer(options.numpire.host, options.numpire.port);

var checkMetricsArrayAgainstParams = function(metrics, min, max) {
	var metrics_min;
	var metrics_max;

	if (min) {
		metrics_min = _.min(metrics);
		console.log('metrics_min', metrics_min);
	}
	if (max) {
		metrics_max = _.max(metrics);
		console.log('metrics_max', metrics_max);
	}
	return (min <= metrics_min && metrics_max <= max);

};

var mapGraphiteData = function(graphiteReturnData, callback) {
	var data = [];
	var jsonGraphite = JSON.parse(graphiteReturnData);
	if (graphiteReturnData.length > 0) {
		console.log('graphiteReturnData', jsonGraphite[0]);
		data = _.map(jsonGraphite[0].datapoints, function(val, key) {
			console.log('valkey', val, key);
			if (val) {
				if (val.length > 0) {
					return val[0];
				}
			}
		});
		callback(data);
	}
};

var getMetricsFromGraphite = function(options, metric, range, callback) {
	var graphite_url = options.host + ":" + options.port;

	var full_url = graphite_url + "/render/?target=" + metric + "&format=json&from=-" + range + "s";
	request({
		url: full_url,
		timeout: 10000
	}, function(error, response, body) {
		//console.log(error, response, body);
		callback(error, body);
	});
};

var check = {
	handler: function(request) {
		getMetricsFromGraphite(options.graphite, request.query.metric, request.query.range, function(err, data) {
			mapGraphiteData(data, function(flattenedData) {
				console.log(flattenedData);
				var isOk = checkMetricsArrayAgainstParams(flattenedData, request.query.min, request.query.max);
				console.log('isOk', isOk);
				if (isOk) {
					request.reply('ok');
				} else {
					request.reply(Hapi.Error.internal('The data returned from graphite was outside of the specified criteria.'));
				}

			});
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