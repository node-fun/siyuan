var assert = require('assert'),
	fs = require('fs'),
	_ = require('underscore'),
	request = require('request').defaults({ json: true }),
	localface = require('localface'),
	User = require('../../models/user'),
	config = require('../../config'),
	apiHost = 'http://localhost:' + config.port + '/api/users';

describe('users', function () {
	// assuming there are at least
	// 100 testing records
	it('finds', function (done) {
		request(apiHost + '/find', {
			qs: {
				page: 3,
				limit: 7
			}
		}, function (err, res, data) {
			var users = data['users'];
			assert.equal(users.length, 7);
			done();
		});
	});
	it('searches', function (done) {
		request(apiHost + '/search', {
			qs: {
				name: 'e'
			}
		}, function (err, res, data) {
			var users = data['users'];
			assert.ok(users.length > 0);
			done();
		});
	});
	it('views', function (done) {
		var id = 33;
		request(apiHost + '/view', {
			qs: {
				id: id
			}
		}, function (err, res, data) {
			var user = data['user'];
			assert.equal(user.id, id);
			assert.ok(user.profile);
			assert.ok(user.friendship);
			done();
		});
	});

	var authData = {
			username: '_test_',
			password: '123321'
		},
		user = User.randomForge().set(authData),
		jar = request.jar(), id;
	it('registers', function (done) {
		request.post(apiHost + '/register', {
			form: user.attributes
		}, function (err, res, data) {
			assert.ok(data['msg']);
			assert.ok(id = data['id']);
			done();
		});
	});
	it('logins', function (done) {
		request.post(apiHost + '/login', {
			jar: jar,
			form: authData
		}, function (err, res, data) {
			assert(data['msg']);
			done();
		});
	});

	var newPassword = 'another password';
	it('resets password', function (done) {
		request.post(apiHost + '/password/reset', {
			jar: jar,
			form: {
				'password': authData['password'],
				'new-password': newPassword
			}
		}, function (err, res, data) {
			assert.ok(data['msg']);
			request.post(apiHost + '/login', {
				jar: jar,
				form: authData
			}, function (err, res, data) {
				assert.ok(data['error']);
				authData['password'] = newPassword;
				done();
			});
		});
	});
	it('updates profile', function (done) {
		request.post(apiHost + '/profile/update', {
			jar: jar,
			form: { 'nickname': 'hahaha' }
		}, function (err, res, data) {
			assert.ok(data['msg']);
			done();
		});
	});
	it('updates avatar', function (done) {
		var gender = user.get('profile')['gender'],
			file = localface.get(gender),
			req, form;
		req = request.post(apiHost + '/avatar/update', {
			jar: jar
		}, function (err, res, data) {
			assert.ok(data['msg']);
			done();
		});
		form = req.form();
		form.append('avatar', fs.createReadStream(file));
	});
	it('adds friend', function (done) {
		request.post(apiHost + '/friends/add', {
			jar: jar,
			form: {
				'id': 33,
				'remark': 'Boss'
			}
		}, function (err, res, data) {
			assert.ok(data['msg']);
			done();
		});
	});
});
