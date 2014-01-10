var _ = require('underscore'),
	User = require('../models/user'),
	errors = require('../lib/errors');

module.exports = function (app) {
	app.get('/api/users/find', function (req, res, next) {
		User.find(req.query)
			.then(function (users) {
				res.api.send({ users: users });
			}).catch(next);
	});
	app.get('/api/users/search', function (req, res, next) {
		User.search(req.query)
			.then(function (users) {
				res.api.send({ users: users });
			}).catch(next);
	});
	app.get('/api/users/view', function (req, res, next) {
		User.view(req.query)
			.then(function (user) {
				res.api.send({ user: user });
			}).catch(next);
	});

	app.post('/api/users/register', function (req, res, next) {
		User.forge(req.body).register()
			.then(function (user) {
				res.api.send({
					msg: 'User registered',
					id: user.id
				});
			}).catch(next);
	});
	app.post('/api/users/login', function (req, res, next) {
		User.forge(req.body).login()
			.then(function (user) {
				res.api.send({
					msg: 'User logged in',
					id: req.session['userid'] = user.id
				});
			}).catch(next);
	});
	app.post('/api/users/logout', function (req, res, next) {
		User.forge({ id: req.session['userid'] })
			.logout()
			.then(function () {
				res.api.send({ msg: 'User logged out' });
			}).catch(next);
	});

	app.post('/api/users/password/reset', function (req, res, next) {
		User.forge({ id: req.session['userid'] })
			.resetPassword(req.body)
			.then(function () {
				res.api.send({ msg: 'Password reset' });
			}).catch(next);
	});
	app.post('/api/users/profile/update', function (req, res, next) {
		User.forge({ id: req.session['userid'] })
			.updateProfile(req.body)
			.then(function () {
				res.api.send({ msg: 'Profile updated' });
			}).catch(next);
	});
	app.post('/api/users/avatar/update', function (req, res, next) {
		if (!req.files['avatar']) return next(errors[20007]);
		var file = req.files['avatar'],
			_3M = 3 * 1024 * 1024;
		if (file['type'] != 'image/jpeg') return next(errors[20005]);
		if (file['size'] > _3M) return next(errors[20006]);
		User.forge({ id: req.session['userid'] })
			.updateAvatar(file['path'])
			.then(function () {
				res.api.send({ msg: 'Avatar updated' });
			}).catch(next);
	});

	app.post('/api/users/friends/add', function (req, res, next) {
		var friendid = req.body['id'],
			remark = req.body['remark'];
		User.forge({ id: req.session['userid'] })
			.addFriend(friendid, remark)
			.then(function () {
				res.send({ msg: 'Friend added' });
			}).catch(next);
	});
	app.post('/api/users/friends/remove', function (req, res, next) {
		var friendid = req.body['id'];
		User.forge({ id: req.session['userid'] })
			.removeFriend(friendid)
			.then(function () {
				res.send({ msg: 'Friend removed' });
			}).catch(next);
	});
	app.post('/api/users/friends/remark', function (req, res, next) {
		var friendid = req.body['id'],
			remark = req.body['remark'];
		User.forge({ id: req.session['userid'] })
			.remarkFriend(friendid, remark)
			.then(function () {
				res.send({ msg: 'Friend remarked' });
			}).catch(next);
	});
};
