var errors = require('../lib/errors');

module.exports = function (app) {
	require('./users')(app);
	require('./followship')(app);
	require('./admin')(app);
	require('./groups')(app);
	require('./activities')(app);
	require('./issues')(app);
	require('./photos')(app);
	require('./cooperations')(app);
	require('./starship')(app);
	require('./admin/index.js')(app);

	app.use('/api', function (data, req, res, next) {
		if (data instanceof Error) return next(data);
		res.send(data);
	});
	app.use('/api', function (err, req, res, next) {
		if (!err['code']) {
			console.error(err.stack ? err.stack : err);
			err = errors[10001];
		}
		res.sendErr(err);
	});
	app.use('/api', function (req, res) {
		res.sendErr(errors[10020]);
	});
};
