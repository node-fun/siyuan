var errors = require('../lib/errors');

module.exports = function (app) {
	require('./users')(app);
	require('./admin')(app);
	require('./groups')(app);
	require('./activities')(app);
	require('./issues')(app);

	app.use('/api', function (data, req, res, next) {
		if (data instanceof Error) return next(data);
		res.send(data);
	});
	app.use('/api', function (err, req, res, next) {
		// 4 parameters required though `next` not used
		if (err['code']) return res.sendErr(err);
		console.error(err.stack);
	});
	app.use('/api', function (req, res) {
		res.sendErr(errors[10020]);
	});
};
