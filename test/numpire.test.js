var assert = require('assert'),
	routing = require('../lib/routing.js'),
	processing = require('../lib/metrics/metricsProcessor.js'),
	nock = require('nock'),
	config = {
		numpire : {
			host: 'http://localhost',
			port: 8000
		},
		graphite : {
			host: 'http://graphite.test.net',
			port: 80
		}

	};

describe('metric processing', function() {
		it('should map graphite format multi-dimensional array to flat array', function(done) {
			var graphiteData = "[{\"target\":\"stats.timers.test.test-rest.messages.saved.mean_90\",\"datapoints\":[[2.7291666666666665,1366221770],[2.8133333333333335,1366221780],[2.811111111111111,1366221790],[2.8421052631578947,1366221800],[2.727272727272727,1366221810],[null,1366221820]]}]";
			processing.mapGraphiteData(graphiteData, function(err, data) {
				assert.deepEqual(data, [ 2.7291666666666665, 2.8133333333333335, 2.811111111111111, 2.8421052631578947, 2.727272727272727, null]);
				done();
			});
		});
		it('should map graphite format multi-dimensional array to flat array', function(done) {
			var graphiteData = "[{\"target\":\"stats.timers.test.test-rest.messages.saved.mean_90\",\"datapoints\":[[2.7291666666666665,1366221770],[2.8133333333333335,1366221780],[2.811111111111111,1366221790],[2.8421052631578947,1366221800],[2.727272727272727,1366221810],[null,1366221820]]}]";
			var isOk = null;
			isOk = processing.checkMetricsArrayAgainstParams([ 2.7291666666666665, 2.8133333333333335, 2.811111111111111, 2.8421052631578947, 2.727272727272727, null],0,3);
			assert.equal(isOk, true);
			isOk = processing.checkMetricsArrayAgainstParams([ 2, 1, 4, 100, 2, null],0,3);
			assert.equal(isOk, false);
			isOk = processing.checkMetricsArrayAgainstParams([ 2, 1, 4, 100, 2, null],0,101);
			assert.equal(isOk, true);

			//TODO: is null 0 or should it be compacted (i.e. tossed out)
			isOk = processing.checkMetricsArrayAgainstParams([null, 2, 1, 4, 100, 2, null],1,101);
			assert.equal(isOk, false);

			isOk = processing.checkMetricsArrayAgainstParams([ 2, 1, 4, 3, 2, 0],1,5);
			assert.equal(isOk, false);

			isOk = processing.checkMetricsArrayAgainstParams([ -2, 1, 4, 3, 2, 0],-3,5);
			assert.equal(isOk, true);
			done();
		});

		it('should construct the appropriate request to graphite', function(done) {
			var graphiteFullRoute = "/render/?target=stats.timers.test.test-rest.messages.saved.mean_90&format=json&from=-60s";
			var graphiteData = "[{\"target\":\"stats.timers.test.test-rest.messages.saved.mean_90\",\"datapoints\":[[2.7291666666666665,1366221770],[2.8133333333333335,1366221780],[2.811111111111111,1366221790],[2.8421052631578947,1366221800],[2.727272727272727,1366221810],[null,1366221820]]}]";
			nock(config.graphite.host)
				.get(graphiteFullRoute)
				.reply(200, graphiteData);
			processing.getMetricsFromGraphite(config.graphite,"stats.timers.test.test-rest.messages.saved.mean_90",60, function(err, data) {
				assert.equal(graphiteData, data);
				done();
			});
		});

		it('should collaborate to get and determine the request is valid', function(done) {
			var graphiteFullRoute = "/render/?target=stats.timers.test.test-rest.messages.saved.mean_90&format=json&from=-60s";
			var graphiteData = "[{\"target\":\"stats.timers.test.test-rest.messages.saved.mean_90\",\"datapoints\":[[2.7291666666666665,1366221770],[2.8133333333333335,1366221780],[2.811111111111111,1366221790],[2.8421052631578947,1366221800],[2.727272727272727,1366221810],[null,1366221820]]}]";
			nock(config.graphite.host)
				.get(graphiteFullRoute)
				.reply(200, graphiteData);
			processing.gatherAndJudge(config.graphite,"stats.timers.test.test-rest.messages.saved.mean_90",60, 0, 3, function(err, isOk) {
				assert.equal(true, isOk);
				done();
			});
		});

		it('should collaborate to get and determine the request is not valid - over max', function(done) {
			var graphiteFullRoute = "/render/?target=stats.timers.test.test-rest.messages.saved.mean_90&format=json&from=-60s";
			var graphiteData = "[{\"target\":\"stats.timers.test.test-rest.messages.saved.mean_90\",\"datapoints\":[[2.7291666666666665,1366221770],[2.8133333333333335,1366221780],[2.811111111111111,1366221790],[2.8421052631578947,1366221800],[2.727272727272727,1366221810],[null,1366221820]]}]";
			nock(config.graphite.host)
				.get(graphiteFullRoute)
				.reply(200, graphiteData);
			processing.gatherAndJudge(config.graphite,"stats.timers.test.test-rest.messages.saved.mean_90",60, 0, 2, function(err, isOk) {
				assert.equal(false, isOk);
				done();
			});
		});
});
