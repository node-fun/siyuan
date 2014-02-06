var assert = require('assert'),
	fs = require('fs'),
	_ = require('underscore'),
	request = require('request').defaults({ json: true }),
	localface = require('localface'),
	User = require('../../models/user'),
	apiHost = host + '/api/users';

describe('users', function () {
	it('finds', function (done) {
		request(apiHost + '/find', {
			qs: {
				page: 1,
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
				profile: {
					name: ' '
				},
				isonline: 1
			}
		}, function (err, res, data) {
			var users = data['users'];
			assert.ok(users.length > 0);
			done();
		});
	});

	var user = User.randomForge().set(authData), id;
	it('registers', function (done) {
		request.post(apiHost + '/register', {
			form: user.attributes
		}, function (err, res, data) {
			assert.ok(data['msg']);
			assert.ok(id = data['id']);
			done();
		});
	});
	it('not registers same', function (done) {
		request.post(apiHost + '/register', {
			form: user.attributes
		}, function (err, res, data) {
			assert.ok(data['error']);
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
			form: { 'major': 'Software Engineer' }
		}, function (err, res, data) {
			assert.ok(data['msg']);
			done();
		});
	});
	it('updates avatar', function (done) {
		var gender = user.data('profile')['gender'],
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
});
