module.exports = function (app) {
	// api users
	require('./users')(app);

	app.use('/api', function (req, res) {
		res.api.sendErr(10020, 'api not found');
	});

	// home page
	app.get('/', function (req, res) {
		res.render('index', {
			title: 'siyuan'
		});
	});
}
