/**
 * Created by Cam on 14-1-8.
 */
var Group = require('../models/groups'),
	Groups = Group.Set;

module.exports = function (app) {
	app.get('/api/groups/find', function (req, res) {
		var offset = req.api.offset,
			limit = req.api.limit,
			match = req.query;
<<<<<<< HEAD
		Groups.forge().query(function(qb){
			for(var k in match){
=======
		Groups.forge().query(function (qb) {
			for (var k in match) {
>>>>>>> ce0aea9d5865247ae003e6a8d83da9a2358dda10
				qb.where(k, match[k]);
			}
		}).query('offset', offset)
			.query('limit', limit)
			.fetch()
			.then(function (groups) {
				groups.mapThen(function (group) {
					return group.load(['members']);
				}).then(function(groups) {
					res.api.send({
						groups: groups
					});
				});
			});
	});
}