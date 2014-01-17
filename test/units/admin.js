var assert = require('assert'),
	request = require('request').defaults({ json: true }),
	Admin = require('../../models/admin'),
	config = require('../../config'),
	apiHost = 'http://localhost:' + config.port + '/api/admin';

describe('admin', function () {
	//there are 3 default admins
	it('finds', function (done) {
		request(apiHost + '/find', {
			qs: {
				page: 1,
				limit: 3
			}
		}, function (err, res, data) {
			var admins = data['admins'];
			assert.equal(admins.length, 3);
			done();
		});
	});
	it('searches', function (done) {
		request(apiHost + '/search', {
			qs: {
				username: 'dm'
			}
		}, function (err, res, data) {
			var admins = data['admins'];
			assert.ok(admins.length > 0);
			done();
		});
	});
	it('views', function (done) {
		var id = 2;
		request(apiHost + '/view', {
			qs: {
				id: id
			}
		}, function (err, res, data) {
			var admin = data['admin'];
			assert.equal(admin.id, id);
			done();
		});
	});

	var authData = {
			username: 'admin1',
			password: '123'
		},
		jar = request.jar(), id;

	it('logins', function(done) {
		request.post(apiHost + '/login', {
			jar: jar,
			form: authData
		}, function(err, res, data) {
			assert.ok(data['msg']);
			assert.ok(data['id']);
		});
	});

	var newPassword = 'xo5506589';
	it('resets password', function(done) {
		request.post(apiHost + '/password/reset', {
			jar: jar,
			form: {
				'password': authData['password'],
				'new-password': newPassword
			}
		}, function(err, res, data) {
			assert.ok(data['msg']);
			request.post(apiHost + '/login', {
				jar: jar,
				form: authData
			}, function(err, res, data) {
				assert.ok(data['error']);
				authData['password'] = newPassword;
				done();
			})
		})
	});
});
