var _ = require('underscore'),
	Activity = require('../models/activity');

module.exports = function (app) {
	app.get('/api/activities/find', function (req, res) {
		var offset = req.api.offset,
			limit = req.api.limit,
			match = req.query;
		Activity.find(match, offset, limit)
			.then(function (activities) {
				activities.mapThen(function (activity) {
					return activity.load(['usership', 'status']);
				})
				.then(function (activities) {
					res.api.send({
						activities: activities
					});
				});
			})
	});
	app.get('/api/activities/join', function (req, res, next) {
		var userid = 1,//req.session['userid'],
			activityData = req.body;
		Activity.forge(activityData).joinActivity(userid)
			.then(function (activity) {
				res.api.send({
					msg: 'join success',
					id: activity.id
				});
			}).catch(next);
	});
}