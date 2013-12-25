var _ = require('underscore'),
	User = require('../models/user'),
	Users = User.Collection,
	privateAttrs = ['password'];

module.exports = function (app) {
	// list users
	app.get('/api/users/find', function (req, res) {
		var offset = req.api.offset,
			limit = req.api.limit,
			query = req.query;
		User.find(query, offset, limit)
			.then(function (users) {
				users.each(function (user) {
					user.attributes = user.omit(privateAttrs);
				});
				res.send(users);
			});
	});
}
