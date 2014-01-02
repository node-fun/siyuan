var errors = require('../lib/errors');

module.exports = function (app) {
	require('./users')(app);
	require('./admin')(app);

	app.use('/api', function (err, req, res, next) {
		// 4 parameters required to take in error
		res.api.sendErr(err);
	});
	app.use('/api', function (req, res) {
		res.api.sendErr(errors[10020]);
	});
}
