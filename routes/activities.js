/**
 * @class 活动
 */
var _ = require('underscore'),
	Promise = require('bluebird'),
	Activity = require('../models/activity'),
	errors = require('../lib/errors');

module.exports = function (app) {
	/**
	 * GET /api/activities/find
	 * @method 活动列表
	 * @param {Number} [id] 活动id
	 * @return {Array}
	 * // GET /api/activities/find?id=45
	 * {
  		"activities": [
		{
		  "id": 1,
		  "ownerid": 11,
		  "groupid": 1,
		  "content": "Puhobjo wonava cukce vo ivo huti havjeli le t",
		  "maxnum": 29,
		  "createtime": 1389706483000,
		  "starttime": "0000-00-00 00:00:00",
		  "duration": 7,
		  "statusid": 4,
		  "avatar": "sihomre",
		  "money": 1037,
		  "status": {
			"id": 4,
			"name": "活动取消"
		  },
		  "usership": [
			{
			  "id": 4,
			  "userid": 10,
			  "activityid": 1,
			  "isaccepted": 0
			},
			{
			  "id": 58,
			  "userid": 5,
			  "activityid": 1,
			  "isaccepted": 0
			}
		  ]
		}]
	*/
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

	/**
	 * GET /api/activities/join
	 * @method 加入活动
	 * @param {String} id 活动id
	 * @return {Array}
	 *
	 */

	app.get('/api/activities/join', function (req, res, next) {
		var userid = req.session['userid'];
		Activity.forge(req.body)
			.fetch()
			.then(function (activity) {
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
			.then(function (activity) {
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
			.then(function (activity) {
				if (activity == null) {
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
	app.post('/api/activities/update', function (req, res, next) {
		var userid = req.session['userid'],
			id = req.body.id,
			content = req.body.content,
			maxnum = req.body.maxnum,
			starttime = req.body.starttime,
			duration = req.body.duration,
			statusid = req.body.statusid,
			money = req.body.money;
		Activity.forge({ 'id': id }).updateActivity(userid, content, maxnum, starttime, duration, statusid, money)
			.then(function (activity) {
				next({
					msg: 'update success',
					id: activity.get('id')
				});
			}).catch(next);
	});

	app.post('/api/activities/create', function (req, res, next) {
		var userid = 1,//req.session['userid'],
			groupid = req.body.groupid,
			content = req.body.content,
			maxnum = req.body.maxnum,
			starttime = req.body.starttime,
			duration = req.body.duration,
			statusid = req.body.statusid,
			money = req.body.money;
		Activity.forge().createActivity(userid, groupid, content, maxnum, starttime, duration, statusid, money)
			.then(function (activity) {
				next({
					msg: 'create success',
					id: activity.get('id')
				});
			});
	});

	app.post('/api/activities/userslist', function(req, res, next) {
		var userid = req.session['userid'],
			id = req.body.id;
		Activity.forge({ 'id': id }).fetch()
			.then(function(activity) {
				activity
					.getUserList(userid)
					.then(function(users) {
						next({ users: users });
					});
			});
	});

	app.post('/api/activities/accept', function(req, res, next) {
		var userid = 1,//req.session['userid'],
			id = req.body.id,
			activityid = req.body.activityid;
		Activity.forge({ 'id': activityid })
			.fetch()
			.then(function(activity) {
				activity.
					acceptJoin(userid, id)
					.then(function(activity) {
						next({ msg: 'accept success' });
					});
			});
	});

	app.post('/api/activities/avatar/update', function (req, res, next) {
		if(!req.files['avatar']) return next(errors[20007]);
		var file = req.files['avatar'],
			_3M = 3 * 1024 * 1024;
		if(file['type'] != 'image/jpeg') return next(errors[20005]);
		if(file['size'] > _3M) return next(errors[20006]);
		Activity.forge({ id: req.id })
			.updateAvatar(file['path'])
			.then(function () {
				next({ msg: 'Avatar updated' });
			});
	});
};

