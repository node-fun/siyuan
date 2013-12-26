var _ = require('underscore'),
	User = require('../models/user'),
	privateAttrs = ['password'];

module.exports = function (app) {
	app.get('/api/users/find', function (req, res) {
		var offset = req.api.offset,
			limit = req.api.limit,
			match = req.query;
		User.find(match, offset, limit)
			.then(function (users) {
				users.each(function (user) {
					user.attributes = user.omit(privateAttrs);
				});
				res.api.send({
					users: users
				});
			});
	});

	app.get('/api/users/search', function (req, res) {
		var offset = req.api.offset,
			limit = req.api.limit,
			match = req.query;
		User.search(match, offset, limit)
			.then(function (users) {
				users.each(function (user) {
					user.attributes = user.omit(privateAttrs);
				});
				res.api.send({
					users: users
				});
			});
	});
}
