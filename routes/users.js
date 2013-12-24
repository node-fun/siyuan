var _ = require('underscore'),
	Users = require('../models/users'),
	User = Users.prototype.model,
	err101 = new Error('invalid id', 101),
	err102 = new Error('no such user', 102),
	privateAttrs = ['password'];

module.exports = function (app) {
	// list users
	app.get('/api/users', function (req, res) {
		var defaultLimit = 10,
			offset, limit;
		if (_.has(req.query, 'limit')) {
			limit = ~~req.query['limit'];
		} else {
			limit = defaultLimit;
		}
		if (_.has(req.query, 'page')) {
			// TODO:
			// give out the page count
			// but not just adjusting
			var page = Math.max(1, ~~req.query['page']);
			offset = (page - 1) * defaultLimit;
		} else {
			offset = ~~req.query['offset'];
		}
		Users.forge()
			.query('offset', offset)
			.query('limit', limit)
			.fetch()
			.then(function (users) {
				_.each(users, function (user, i, list) {
					// omit some attributes
					// `user` here is just a normal object
					// containing keys
					list[i] = _.omit(user, privateAttrs);
				});
				res.send(users);
			});
	});

	// find user by id
	app.get('/api/users/:id', function (req, res) {
		var _id = req.params['id'], id;
		if (!/^\d+$/.test(_id)) {
			return res.sendErr(err101);
		}
		id = ~~_id;
		User.forge({
			id: id
		}).fetch()
			.then(function (user) {
				if (!user) {
					return res.sendErr(err102);
				}
				// omit some attributes
				// `user` here is a `Model`
				// with `.attributes`
				user = user.omit(privateAttrs);
				res.send(user);
			});
	});
}