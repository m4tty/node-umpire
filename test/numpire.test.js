var assert = require('assert'),
	numpire = require('../lib/numpire.js'),
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


describe('GET /check', function() {


		it('should return a 400 if params not passed', function(done) {

		});


});
