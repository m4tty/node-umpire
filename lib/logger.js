var options = require('../config.json');

var logger = exports;

logger.log = function(message) {
   if (options.numpire.debug) console.log(message);
}

