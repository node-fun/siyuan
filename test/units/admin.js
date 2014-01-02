var assert = require('assert'),
	request = require('request').defaults({json: true}),
	Admin = require('../../models/admin'),
	config = require('../../config'),
	apiHost = 'http://localhost:' + config.port + 'api/admin';

describe('admin', function () {
	//there are 3 default admins
	it('finds', function (done) {
		request(apiHost + '/find', {
			qs: {
				page: 1,
				limit: 5
			}
		}, function (err, res, data) {
			var admins = data['admins'];
			assert.equal(admins.length, 7);
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
	it('registers', function (done) {
		request.post(apiHost + '/reg', {
			form: Admin.randomForge().set(authData).attributes
		}, function (err, res, data) {
			assert.ok(data['msg']);
			assert.ok(id = data['id']);
			done();
		});
	});
	it('logins', function (done) {
		Admin.forge({id: id}).fetch()
			.then(function (admin) {
				request.post(apiHost + '/login', {
					form: authData,
					jar: jar
				})
			}, function (err, res, data) {
				assert.ok(data['msg']);
				assert.ok(data['id']);
				done();
			});
	});
	it('logout', function (done) {
		Admin.forge({id: id}).fetch()
			.then(function (admin) {
				request.post(apiHost + 'logout', {
					jar: jar
				}, function (err, res, data) {
					assert.ok(data['msg']);
					done();
				})
			});
	});
});
