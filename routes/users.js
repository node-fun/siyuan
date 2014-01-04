var _ = require('underscore'),
	User = require('../models/user'),
	errors = require('../lib/errors');

module.exports = function (app) {
	app.get('/api/users/find', function (req, res) {
		var offset = req.api.offset,
			limit = req.api.limit,
			match = req.query;
		User.find(match, offset, limit)
			.then(function (users) {
				res.api.send({ users: users });
			});
	});

	app.get('/api/users/search', function (req, res) {
		var offset = req.api.offset,
			limit = req.api.limit,
			match = req.query;
		User.search(match, offset, limit)
			.then(function (users) {
				res.api.send({ users: users });
			});
	});

	app.get('/api/users/view', function (req, res, next) {
		var id = req.query['id'];
		User.view(id)
			.then(function (user) {
				res.api.send({ user: user });
			}).catch(next);
	});

	app.post('/api/users/register', function (req, res, next) {
		var userData = req.body;
		User.forge(userData).register()
			.then(function (user) {
				res.api.send({
					msg: 'register success',
					id: user.id
				});
			}).catch(next);
	});

	app.post('/api/users/login', function (req, res, next) {
		var userData = req.body;
		User.forge(userData).login()
			.then(function (user) {
				res.api.send({
					msg: 'login success',
					id: req.session['userid'] = user.id
				});
			}).catch(next);
	});
	app.post('/api/users/logout', function (req, res, next) {
		User.forge({ id: req.session['userid'] })
			.logout()
			.then(function () {
				res.api.send({ msg: 'logout success' });
			}).catch(next);
	});

	app.post('/api/users/password/reset', function (req, res, next) {
		User.forge({ id: req.session['userid'] })
			.resetPassword(req.body)
			.then(function () {
				res.api.send({ msg: 'password reset' });
			}).catch(next);
	});
	app.post('/api/users/profile/update', function (req, res, next) {
		User.forge({ id: req.session['userid'] })
			.updateProfile(req.body)
			.then(function () {
				res.api.send({ msg: 'profile updated' });
			}).catch(next);
	});
	app.post('/api/users/avatar/update', function (req, res, next) {
		try {
			if (!req.files['avatar']) throw errors[20007];
			var file = req.files['avatar'],
				_3M = 3 * 1024 * 1024;
			if (file['type'] != 'image/jpeg') throw errors[20005];
			if (file['size'] > _3M) throw errors[20006];
			User.forge({ id: req.session['userid'] })
				.updateAvatar(file['path'])
				.then(function () {
					res.api.send({ msg: 'avatar updated' });
				}).catch(next);
		} catch (err) {
			next(err);
		}
	});

	app.post('/api/users/friends/add', function (req, res, next) {
		var friendid = req.body['id'],
			remark = req.body['remark'];
		User.forge({ id: req.session['userid'] })
			.addFriend(friendid, remark)
			.then(function () {
				res.send({ msg: 'friend added' });
			}).catch(next);
	});
	app.post('/api/users/friends/remove', function (req, res, next) {
		var friendid = req.body['id'];
		User.forge({ id: req.session['userid'] })
			.removeFriend(friendid)
			.then(function () {
				res.send({ msg: 'friend removed' });
			}).catch(next);
	});
	app.post('/api/users/friends/remark', function (req, res, next) {
		var friendid = req.body['id'],
			remark = req.body['remark'];
		User.forge({ id: req.session['userid'] })
			.remarkFriend(friendid, remark)
			.then(function () {
				res.send({ msg: 'friend remarked' });
			}).catch(next);
	});
}
