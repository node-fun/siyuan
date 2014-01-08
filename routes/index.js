var errors = require('../lib/errors');

module.exports = function (app) {
	require('./users')(app);
	require('./admin')(app);
	require('./activities')(app);
	app.use('/api', function (err, req, res, next) {
		// 4 parameters required to take in error
		if (err['code']) return res.api.sendErr(err);
		console.error(err.stack);
	});
	app.use('/api', function (req, res) {
		res.api.sendErr(errors[10020]);
	});
};
