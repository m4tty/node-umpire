var Hapi = require('hapi');
var request = require('request');
var _ = require('underscore');


var checkMetricsArrayAgainstParams = function(metrics, min, max) {
	var metrics_min;
	var metrics_max;

	if (min !== null && min !== undefined) {
		metrics_min = _.min(metrics);
	}
	if (max !== null && max !== undefined) {
		metrics_max = _.max(metrics);
	}
	return (min <= metrics_min && metrics_max <= max);
};

var mapGraphiteData = function(graphiteReturnData, callback) {
	var data = [];
	if (graphiteReturnData !== null && graphiteReturnData !== undefined) {
		try {

			var jsonGraphite = JSON.parse(graphiteReturnData);

			for (var i = jsonGraphite.length - 1; i >= 0; i--) {
				var tempData = _.map(jsonGraphite[i].datapoints, function(val, key) {
					if (val) {
						if (val.length > 0) {
							return val[0];
						}
					}
				});
				[].push.apply(data, tempData);
			};
			// if (jsonGraphite.length > 0) {
			// 	data = _.map(jsonGraphite[0].datapoints, function(val, key) {
			// 		if (val) {
			// 			if (val.length > 0) {
			// 				return val[0];
			// 			}
			// 		}
			// 	});
			// }
		} catch (e) {
			return callback(new Error('Unable to parse the response from graphite.'));
		}
	}

	return callback(null, data);
};

var getMetricsFromGraphite = function(options, metric, range, callback) {
	var graphite_url = options.host + ":" + options.port;

	var full_url = graphite_url + "/render/?target=" + metric + "&format=json&from=-" + range + "s";
	request({
		url: full_url,
		timeout: 10000
	}, function(error, response, body) {
		return callback(error, body);
	});
};


var gatherAndJudge = function(options, metric, range, min, max, callback) {
	getMetricsFromGraphite(options, metric, range, function(err, data) {
		if (err) {
			return callback(err);
		}
		mapGraphiteData(data, function(err, flattenedData) {
			if (err) {
				return callback(err);
			}
			var isOk = checkMetricsArrayAgainstParams(flattenedData, min, max);
			return callback(null, isOk);
		});
	});

};



module.exports = {
	gatherAndJudge: gatherAndJudge,
	getMetricsFromGraphite: getMetricsFromGraphite,
	mapGraphiteData: mapGraphiteData,
	checkMetricsArrayAgainstParams: checkMetricsArrayAgainstParams
};