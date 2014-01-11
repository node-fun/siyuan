/**
 * Created by Cam on 14-1-8.
 */
var _ = require('underscore'),
	Group = require('../models/group'),
	errors = require('../lib/errors'),
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
					next({
						groups: groups
					});
				});
			}).catch(next);
	});
	//params: name, description
	app.post('/api/groups/create', function(req, res, next){
		var user = req.user;
		if (!user) return next(errors[21301]);
		if( !req.body['name'] || !req.body['description']){
			return next(errors[10008]);
		}
		Group.forge({name: req.body['name']})
			.fetch()
			.then(function(group){
				if(group){
					return next(errors[20506]);
				}
				return Group.forge(_.extend({
					ownerid: user.id
				}, req.body)).save();
			}).then(function(group){
				next({
					message: 'group created',
					id: group.id
				});
			});
	});
};
