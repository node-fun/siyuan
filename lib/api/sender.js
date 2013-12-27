var _ = require('underscore');

module.exports = function (req, res, next) {
	// api scope in res
	res.api = {};

	res.api.send = function (data) {
		res.send(_.extend({

		}, data);
	}

	res.api.sendErr = function (code, message) {
		res.api.send({
			request: req.originalUrl,
			error_code: code,
			error: message
		});
	}

	next();
}
