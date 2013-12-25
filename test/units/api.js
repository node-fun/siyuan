var assert = require('assert'),
	_ = require('underscore'),
	request = require('request').defaults({json: true}),
	config = require('../../config'),
	apiHost = 'http://localhost:' + config.port + '/api',
	url;

describe('api', function () {
	describe('users', function () {
		// assuming that there are
		// 200+ testing records
		describe('finds', function () {
			var url = apiHost + '/users/find';
			it('with offset/limit', function (done) {
				request(url, {
					qs: {
						offset: 50,
						limit: 5
					}
				}, function (err, res, users) {
					assert.equal(users.length, 5);
					done();
				});
			});
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
			it('with id that exists', function (done) {
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
			it('with id that does not exist', function (done) {
				var id = -1;
				request(url, {
					qs: {
						id: id
					}
				}, function (err, res, users) {
					assert.equal(users.length, 0);
					done();
				});
			});
		});
	});
});
