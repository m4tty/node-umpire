var Hapi = require('hapi');
var request = require('request');
var _ = require('underscore');
var logger = require('../logger');

var checkMetricsArrayAgainstParams = function(metrics, min, max) {
	var metrics_min = _.min(metrics);
	var metrics_max = _.max(metrics);

	if (min == null || min == undefined) min = metrics_min;
	if (max == null || max == undefined) max = metrics_max;

	logger.log("min: " + min);
	logger.log("max: " + max);
	logger.log("metrics_min:" + metrics_min);
	logger.log("metrics_max:" + metrics_max);
	logger.log("min <= metrics_min: " + (min <= metrics_min));
	logger.log("metrics_max <= max: " + (metrics_max <= max));
	
	return (min <= metrics_min && metrics_max <= max);
};

var mapGraphiteData = function(graphiteReturnData, callback) {
	var data = [];
	if (graphiteReturnData !== null && graphiteReturnData !== undefined) {
		try {

			logger.log("return data:" + graphiteReturnData);
			var jsonGraphite = JSON.parse(graphiteReturnData);

			for (var i = jsonGraphite.length - 1; i >= 0; i--) {
				var tempData = _.map(jsonGraphite[i].datapoints, function(val, key) {
					
					logger.log("val: " + val);
					
					if (val) {
						if (val.length > 0) {
							return val[0];
						}
					}
				});
				
				tempData = _.compact(tempData);
				if (tempData != null) { [].push.apply(data, tempData); }
			};
		} catch (e) {
			return callback(new Error('Unable to parse the response from graphite.'));
		}
	}

	return callback(null, data);
};

var getMetricsFromGraphite = function(options, metric, range, callback) {
	var graphite_url = options.host + ":" + options.port;
	var full_url = graphite_url + "/render/?target=" + metric + "&format=json&from=-" + range + "s";

	logger.log(full_url);

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
