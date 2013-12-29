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
				if (!user) {
					res.api.sendErr(21300, 'register fail');
					return;
				}
				res.api.send({
					msg: 'register success',
					id: user.id
				});
			});
	});

	app.post('/api/users/login', function (req, res) {
		var userData = req.body;
		User.forge(userData).login()
			.then(function (user) {
				if (!user) {
					res.api.sendErr(21302, 'login fail');
					return;
				}
				res.api.send({
					msg: 'login success',
					id: req.session.userid = user.id
				});
			});
	});
	app.post('/api/users/logout', function (req, res) {
		User.forge({id: req.session.userid}).logout()
			.then(function (user) {
				if (!user) {
					res.api.sendErr(21301, 'auth fail');
					return;
				}
				res.api.send({msg: 'logout success'});
			});
	});
}
