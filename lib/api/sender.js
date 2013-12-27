var _ = require('underscore');

module.exports = function (req, res, next) {
	// api scope in res
	res.api = {};

	res.api.send = function (data) {
		res.send(_.extend({
			request: req.originalUrl
		}, data));
	}

	res.api.sendErr = function (statusCode, code, message) {
		res.status(statusCode).api.send({
			error_code: code,
			error: message
		});
	}

	next();
}
