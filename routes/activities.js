var _ = require('underscore'),
	Activity = require('../models/activity');

module.exports = function (app) {
	app.get('/api/activities/find', function (req, res) {
		var offset = req.api.offset,
			limit = req.api.limit,
			match = req.query;
		Activity.find(match, offset, limit)
			.then(function (activities) {
				res.api.send({
					activities: activities
				});
			});
	});
	app.get('/api/test/activities/find', function (req, res) {
		Activity.forge({ 'id': 1 })
			.fetch()
			.then(function(activity) {
				res.api.send({
					activity: activity.usership()
				});
			});
	});
}