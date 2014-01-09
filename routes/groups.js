/**
 * Created by Cam on 14-1-8.
 */
var Group = require('../models/groups'),
	Groups = Group.Set;

module.exports = function(app){
	app.get('/api/groups/find', function(req, res){
		var offset = req.api.offset,
			limit = req.api.limit,
			match = req.query;
		Groups.forge().query(function(qb){
			for(var k in match){
				qb.where(k, match[k]);
			}
		}).query('offset', offset)
			.query('limit',limit)
			.fetch()
			.then(function(groups){
				res.api.send({groups:groups})
			});
	});
}