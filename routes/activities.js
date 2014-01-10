var _ = require('underscore'),
	Activity = require('../models/activity');

module.exports = function (app) {
	app.get('/api/activities/find', function (req, res, next) {
		Activity.find(req.query)
			.then(function (activities) {
				activities.mapThen(function (activity) {
					return activity.load(['usership', 'status']);
				})
				.then(function (activities) {
					res.api.send({
						activities: activities
					});
				});
			}).catch(next);
	});
	app.get('/api/activities/join', function (req, res, next) {
		var userid = 1;//req.session['userid'];
		Activity.forge(req.body).joinActivity(userid)
			.then(function (activity) {
				res.api.send({
					msg: 'join success',
					id: activity.id
				});
			}).catch(next);
	});
};
