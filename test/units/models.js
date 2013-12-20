var assert = require('assert'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	Users = require('../../models/users'),
	User = Users.model;

describe('models', function () {
	describe('users', function () {
		var numUsers = 100,
			firstId,
			users;

		it('saves', function (done) {
			users = Users.forge();
			_.times(numUsers, function (i) {
				users.add(User.createRandomUser());
			});
			users.invokeThen('save').then(function () {
				assert.ok(_.every(users.models, function (m) {
					return m.id;
				}));
				firstId = users.at(0).id;
				done();
			});
		});

		it('fetches', function (done) {
			var users1 = Users.forge();
			_.times(numUsers, function (i) {
				users1.add(User.forge({
					id: firstId + i
				}));
			});
			users1.invokeThen('fetch').then(function () {
				assert.ok(_.every(users1.models, function (m) {
					return m.get('username');
				}));
				done();
			});
		});

		it('destroys', function (done) {
			users.invokeThen('destroy').then(function () {
				assert.ok(_.every(users.models, function (m) {
					return !m.id;
				}));
				done();
			});
		});
	});
});
