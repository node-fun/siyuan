var _ = require('underscore');

module.exports = function (req, res, next) {
	// error sending
	res.sendErr = function (err) {
		// assuming `err` has a `code`
		res.send({
			method: req.method,
			request: req.originalUrl,
			errorCode: err.code,
			error: err.message
		});
	};

	next();
};
