var Hapi = require('hapi');
var request = require('request');
var _ = require('underscore');


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
	if (graphiteReturnData !== null && graphiteReturnData !== undefined) {
		try {
			var jsonGraphite = JSON.parse(graphiteReturnData);
			if (jsonGraphite.length > 0) {
				console.log('graphiteReturnData', jsonGraphite[0]);
				data = _.map(jsonGraphite[0].datapoints, function(val, key) {
					console.log('valkey', val, key);
					if (val) {
						if (val.length > 0) {
							return val[0];
						}
					}
				});
			}
		} catch (e) {
			console.log('Unable to parse the response from graphite.');
		}
	}

	callback(data);
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


var gatherAndJudge = function(options, metric, range, min, max, callback) {
		getMetricsFromGraphite(options, metric, range, function(err, data) {
			if (err) {
				return callback(err);
			}
			mapGraphiteData(data, function(flattenedData) {
				console.log(flattenedData);
				var isOk = checkMetricsArrayAgainstParams(flattenedData, min, max);
				callback(null, isOk);
			});
		});

};



module.exports = { gatherAndJudge: gatherAndJudge };

