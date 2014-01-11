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
		var userid = req.session['userid'];
		Activity.forge(req.body)
			.fetch()
			.then(function(activity) {
				return activity.joinActivity(userid)
					.then(function (usership) {
						res.api.send({
							msg: 'join success',
							id: usership.get('id')
						});
					});
			}).catch(next);
	});
	app.get('/api/activities/cancel', function (req, res, next) {
		var userid = req.session['userid'];
		Activity.forge(req.body)
			.fetch()
			.then(function(activity) {
				return activity.cancelActivity(userid)
					.then(function () {
						res.api.send({
							msg: 'cancel success'
						});
					});
			}).catch(next);
	});
	app.get('/api/activities/delete', function (req, res, next) {
		var userid = 1;//req.session['userid'];
			Activity.forge(req.body)
			.fetch()
			.then(function(activity) {
				return activity.deleteActivity(userid)
					.then(function () {
						res.api.send({
							msg: 'delete success'
						});
					});
			}).catch(next);
	});
};
