/**
 * Created by Cam on 14-1-8.
 */
var _ = require('underscore'),
	Group = require('../models/groups'),
	Groups = Group.Set;

module.exports = function (app) {
	app.get('/api/groups/find', function (req, res, next) {
		var query = req.query,
			accepts = ['id', 'ownerid', 'name'];
		Groups.forge().query(function (qb) {
			_.each(accepts, function(k){
				if (k in query) {
					qb.where(k, query[k]);
				}
			});
		}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch()
			.then(function (groups) {
				groups.mapThen(function (group) {
					return group.load(['members']);
				}).then(function(groups) {
					res.api.send({
						groups: groups
					});
				});
			}).catch(next);
	});
};
