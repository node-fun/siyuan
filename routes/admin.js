/**
 * @class 管理员
 */
var _ = require('underscore'),
	Admin = require('../models/admin');

module.exports = function (app) {
	/**
	 * POST /api/admin/find
	 * @method 管理员列表
	 * @param {Number} [id]
	 * @return {Array}
	 * {  
		  "admins": [  
			{  
			  "id": 1,  
			  "username": "admin1",  
			  "email": null,  
			  "lastip": null,  
			  "lasttime": null  
			},  
			{  
			  "id": 2,  
			  "username": "admin2",  
			  "email": null,  
			  "lastip": null,  
			  "lasttime": null  
			},  
			{  
			  "id": 3,  
			  "username": "admin3",  
			  "email": null,  
			  "lastip": null,  
			  "lasttime": null  
			}  
		  ]  
		}  
	 */
	app.get('/api/admin/find', function (req, res, next) {
		Admin.find(req.query)
			.then(function (admins) {
				admins.each(function (admin) {
					admin.attributes = admin.omit(['regtime']);
				});
				next({
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
				next({
					admins: admins
				});
			}).catch(next);
	});

	app.get('/api/admin/view', function (req, res, next) {
		Admin.view(req.query)
			.then(function (admin) {
				next({ admin: admin });
			}).catch(next);
	});

	app.post('/api/admin/register', function (req, res, next) {
		Admin.forge(req.body).register()
			.then(function (admin) {
				next({
					msg: 'register success',
					id: admin.id
				});
			}).catch(next);
	});

	/**
	 * POST /api/admin/login
	 * @method 管理员登录
	 * @param {String} username
	 * @param {String} password
	 * @return {JSON}
	 * {  
	 * 		msg: login success,  
	 * 		id: 2  
	 * }  
	 */
	app.post('/api/admin/login', function (req, res, next) {
		Admin.forge(req.body).login()
			.then(function (admin) {
				next({
					msg: 'login success',
					id: req.session.adminid = admin.id
				});
			}).catch(next);
	});

	/**
	 * POST /api/admin/logout
	 * @method 管理员登出
	 * @return {JSON}
	 * {  
	 * 		msg: logout success  
	 * }  
	 */
	app.post('/api/admin/logout', function (req, res, next) {
		Admin.forge({ id: req.session.adminid }).logout()
			.then(function () {
				req.session.adminid = null,
				next({ msg: 'logout success' });
			}).catch(next);
	});

	/**
	 * POST /api/admin/password/reset
	 * @method 密码重置
	 * @param {String} password
	 * @param {String} new-password
	 * @return {JSON}
	 * {  
	 * 		msg: password reset  
	 * }  
	 */
	app.post('/api/admin/password/reset', function (req, res, next) {
		Admin.forge({id: req.session['adminid']})
			.resetPassword((req.body))
			.then(function () {
				next({ msg: 'password reset' });
			}).catch(next);
	});
};
