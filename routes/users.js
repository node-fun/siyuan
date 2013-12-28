var _ = require('underscore'),
	User = require('../models/user');

module.exports = function (app) {
	app.get('/api/users/find', function (req, res) {
		var offset = req.api.offset,
			limit = req.api.limit,
			match = req.query;
		User.find(match, offset, limit)
			.then(function (users) {
				users.each(function (user) {
					user.attributes = user.omit(['regtime']);
				});
				res.api.send({users: users});
			});
	});

	app.get('/api/users/search', function (req, res) {
		var offset = req.api.offset,
			limit = req.api.limit,
			match = req.query;
		User.search(match, offset, limit)
			.then(function (users) {
				users.each(function (user) {
					user.attributes = user.omit(['regtime']);
				});
				res.api.send({users: users});
			});
	});

	app.get('/api/users/view', function (req, res) {
		var id = req.query['id'];
		User.view(id)
			.then(function (user) {
				if (!user) {
					res.api.sendErr(20003, 'user not found');
					return;
				}
				res.api.send({user: user});
			});
	});

	app.post('/api/users/reg', function (req, res) {
		var userData = req.body;
		User.forge(userData).register()
			.then(function (user) {
				res.api.send({id: user.id});
			});
	});
}
