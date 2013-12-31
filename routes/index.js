module.exports = function (app) {
	// api users
	require('./users')(app);

	app.use('/api', function (req, res) {
		res.api.sendErr(10020, 'invalid api');
	});
}
