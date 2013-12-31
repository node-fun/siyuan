var assert = require('assert'),
	request = require('request').defaults({json: true}),
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
				username: 'e'
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
			done();
		});
	});

	var authData = {
			username: '_test_',
			password: '123321'
		},
		jar = request.jar(), id;
	it('registers', function (done) {
		request.post(apiHost + '/reg', {
			form: User.randomForge().set(authData).attributes
		}, function (err, res, data) {
			assert.ok(data['msg']);
			assert.ok(id = data['id']);
			done();
		});
	});
	it('logins', function (done) {
		User.forge({id: id}).fetch()
			.then(function (user) {
				assert.equal(user.get('isonline'), 0);
				request.post(apiHost + '/login', {
					form: authData,
					jar: jar
				}, function (err, res, data) {
					assert.ok(data['msg']);
					assert.ok(data['id']);
					User.forge({id: id}).fetch()
						.then(function (user) {
							assert.equal(user.get('isonline'), 1);
							done();
						});
				});
			});
	});
	it('logouts', function (done) {
		User.forge({id: id}).fetch()
			.then(function (user) {
				assert.equal(user.get('isonline'), 1);
				request.post(apiHost + '/logout', {
					jar: jar
				}, function (err, res, data) {
					assert.ok(data['msg']);
					User.forge({id: id}).fetch()
						.then(function (user) {
							assert.equal(user.get('isonline'), 0);
							done();
						});
				});
			});
	});
});
