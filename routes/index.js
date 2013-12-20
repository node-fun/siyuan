module.exports = function(app) {
	// api users
	require('./users')(app);

	// home page
	app.get('/', function(req, res) {
		res.render('index', {
			title: 'Express'
		});
	});
}