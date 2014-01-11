var _ = require('underscore'),
	Promise = require('bluebird'),
	Activity = require('../models/activity'),
	errors = require('../lib/errors');

module.exports = function (app) {
	app.get('/api/activities/find', function (req, res, next) {
		Activity.find(req.query)
			.then(function (activities) {
				activities.mapThen(function (activity) {
					return activity.load(['usership', 'status']);
				})
				.then(function (activities) {
					next({
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
						next({
							msg: 'join success',
							id: usership.get('id')
						});
					});
			}).catch(next);
	});
	app.post('/api/activities/cancel', function (req, res, next) {
		var userid = req.session['userid'];
		Activity.forge(req.body)
			.fetch()
			.then(function(activity) {
				return activity.cancelActivity(userid)
					.then(function () {
						next({
							msg: 'cancel success'
						});
					});
			}).catch(next);
	});
	app.post('/api/activities/end', function (req, res, next) {
		var userid = req.session['userid'];
			Activity.forge(req.body)
			.fetch()
			.then(function(activity) {
				if(activity == null) {
					return Promise.rejected(errors[40017]);
				}
				return activity.endActivity(userid)
					.then(function () {
						next({
							msg: 'end success'
						});
					});
			}).catch(next);
	});
	app.get('/api/activities/update', function(req, res, next) {
		var userid = req.session['userid'],
			id = req.body.id,
			content = req.body.content,
			maxnum = req.body.maxnum,
			starttime = req.body.starttime,
			duration = req.body.duration,
			statusid = req.body.statusid,
			money = req.body.money;
		Activity.forge({ 'id': id }).updateActivity(userid, content, maxnum, starttime, duration, statusid, money)
			.then(function(activity) {
				next({
					msg: 'update success',
					id: activity.get('id')
				});
			}).catch(next);
	});
};
