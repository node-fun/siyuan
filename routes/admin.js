var _ = require('underscore'),
	Admin = require('../models/admin');

module.exports = function (app) {
	app.get('/api/admin/find', function (req, res, next) {
		Admin.find(req.query)
			.then(function (admins) {
				admins.each(function (admin) {
					admin.attributes = admin.omit(['regtime']);
				});
				res.api.send({
					admins: admins
				});
			}).catch(next);
	});

	app.get('/api/admin/search', function (req, res, next) {
		Admin.search(req.query)
			.then(function (admins) {
				admins.each(function (admin) {
					admin.attributes = admin.omit(['regtime']);
				});
				res.api.send({
					admins: admins
				});
			}).catch(next);
	});

	app.get('/api/admin/view', function (req, res, next) {
		Admin.view(req.query)
			.then(function (admin) {
				res.api.send({ admin: admin });
			}).catch(next);
	});

	app.post('/api/admin/register', function (req, res, next) {
		Admin.forge(req.body).register()
			.then(function (admin) {
				res.api.send({
					msg: 'register success',
					id: admin.id
				});
			}).catch(next);
	});

	app.post('/api/admin/login', function (req, res, next) {
		Admin.forge(req.body).login()
			.then(function (admin) {
				res.api.send({
					msg: 'login success',
					id: req.session.adminid = admin.id
				});
			}).catch(next);
	});

	app.post('/api/admin/logout', function (req, res, next) {
		Admin.forge({ id: req.session.adminid }).logout()
			.then(function () {
				res.api.send({ msg: 'logout success' });
			}).catch(next);
	});

	app.post('/api/admin/password/reset', function (req, res, next) {
		Admin.forge({id: req.session['adminid']})
			.resetPassword((req.body))
			.then(function () {
				res.api.send({ msg: 'password reset' });
			}).catch(next);
	});
};