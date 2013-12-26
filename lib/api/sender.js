var _ = require('underscore');

module.exports = function (req, res, next) {
	// api scope in res
	var resApi = res.api = {};

	resApi.send = function (data) {
		res.send(_.extend({
			request: req.originalUrl
		}, data));
	}

	resApi.sendErr = function (statusCode, code, message) {
		res.status(statusCode);
		resApi.send({
			error_code: code,
			error: message
		});
	}

	next();
}
