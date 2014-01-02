var _ = require('underscore'),
	Admin = require('../models/admin');

module.exports = function (app) {
	app.get('/api/admin/find', function (req, res) {
		var offset = req.api.offset,
			limit = req.api.limit,
			match = req.query;
		Admin.find(match, offset, limit)
			.then(function (admins) {
				admins.each(function (admin) {
					admin.attributes = admin.omit(['regtime']);
				});
				res.api.send({
					admins: admins
				});
			});
	});

	app.get('/api/admin/search', function (req, res) {
		var offset = req.api.offset,
			limit = req.api.limit,
			match = req.query;
		Admin.search(match, offset, limit)
			.then(function (admins) {
				admins.each(function (admin) {
					admin.attributes = admin.omit(['regtime']);
				});
				res.api.send({
					admins: admins
				});
			});
	});

	app.get('api/admin/view', function (req, res) {
		var id = req.api['id'];
		Admin.view(id)
			.then(function (admin) {
				if (!admin) {
					res.api.sendErr(20003, 'admin not found');
					return;
				}
				res.api.send({admin: admin});
			});
	});

	app.post('/api/admin/reg', function (req, res) {
		var adminData = req.body;
		Admin.forge(adminData).register()
			.then(function (admin) {
				if (!admin) {
					res.api.sendErr(21300, 'register fail');
					return;
				}
				res.api.send({
					msg: 'register success',
					id: admin.id
				});
			});
	});

	app.post('/api/admin/login', function (req, res) {
		var adminData = req.body;
		Admin.forge(adminData).login()
			.then(function (admin) {
				if (!admin) {
					res.api.sendErr(21302, 'login fail');
					return;
				}
				res.api.send({
					msg: 'login success',
					id: req.session.userid = admin.id
				});
			});
	});

	app.post('/api/admin/logout', function (req, res) {
		Admin.forge({id: req.session.userid}).logout()
			.then(function (admin) {
				if (!admin) {
					res.api.sendErr(21301, 'auth fail');
					return;
				}
				res.api.send({msg: 'logout success'});
			});
	});
}