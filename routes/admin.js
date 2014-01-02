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

	app.get('/api/admin/view', function (req, res) {
		var id = req.query['id'];
		Admin.view(id)
			.then(function (admin) {
				res.api.send({ admin: admin });
			}).catch(function (err) {
				res.api.sendErr(err);
			});
	});

	app.post('/api/admin/register', function (req, res) {
		var adminData = req.body;
		Admin.forge(adminData).register()
			.then(function (admin) {
				res.api.send({
					msg: 'register success',
					id: admin.id
				});
			})
			.catch(function (err) {
				res.api.sendErr(err);
			});
	});

	app.post('/api/admin/login', function (req, res) {
		var adminData = req.body;
		Admin.forge(adminData).login()
			.then(function (admin) {
				res.api.send({
					msg: 'login success',
					id: req.session.adminid = admin.id
				});
			})
			.catch(function (err) {
				res.api.sendErr(err);
			});
	});

	app.post('/api/admin/logout', function (req, res) {
		Admin.forge({ id: req.session.adminid }).logout()
			.then(function () {
				res.api.send({ msg: 'logout success' });
			})
			.catch(function (err) {
				res.api.sendErr(err);
			});
	});
}