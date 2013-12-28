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

	var user = User.randomForge();
	it('registers', function (done) {
		request.post(apiHost + '/reg', {
			form: user.attributes
		}, function (err, res, data) {
			assert.ok(data['id']);
			done();
		});
	});
	// TODO
});
