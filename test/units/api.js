var assert = require('assert'),
	request = require('request').defaults({json: true}),
	config = require('../../config'),
	apiHost = 'http://localhost:' + config.port + '/api';

describe('api', function () {
	describe('users', function () {
		// assuming that there are
		// 200+ testing records
		describe('finds', function () {
			var url = apiHost + '/users/find';
			it('with page/limit', function (done) {
				request(url, {
					qs: {
						page: 3,
						limit: 7
					}
				}, function (err, res, users) {
					assert.equal(users.length, 7);
					done();
				});
			});
			it('with id', function (done) {
				var id = 6, user;
				request(url, {
					qs: {
						id: id
					}
				}, function (err, res, users) {
					assert.equal(users.length, 1);
					user = users[0];
					assert.equal(user.id, id);
					assert.equal('password' in user, false);
					done();
				});
			});
		});
		describe('searches', function () {
			var url = apiHost + '/users/search';
			it('with username', function (done) {
				request(url, {
					qs: {
						username: 'e'
					}
				}, function (err, res, users) {
					assert.ok(users.length > 0);
					done();
				});
			});
		});
	});
});
