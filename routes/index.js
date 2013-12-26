module.exports = function (app) {
	// api users
	require('./users')(app);

	app.use('/api', function (req, res) {
		res.api.sendErr(404, 1, 'no such api');
	});

	// home page
	app.get('/', function (req, res) {
		res.render('index', {
			title: 'siyuan'
		});
	});
}
