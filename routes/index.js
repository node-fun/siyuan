var errors = require('../lib/errors');

module.exports = function (app) {
	// api users
	require('./users')(app);

	app.use('/api', function (req, res) {
		res.api.sendErr(errors[10020]);
	});
}
