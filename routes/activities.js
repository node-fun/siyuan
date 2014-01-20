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
	 * @param {String} [name] 活动名称
	 * @return {Array}
	 * // GET /api/activities/find?id=45
	 * <pre>{
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
		}]</pre>
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
	 * POST /api/activities/join
	 * @method 加入活动
	 * @param {Number} id:活动id
	 * @return {JSON}
	 * <pre>{
	 * 		msg: join succes,  
	 * 		id: 6  
	 * }</pre>
	 */
	app.post('/api/activities/join', function (req, res, next) {
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

	/**
	 * POST /api/activities/cancel
	 * @method 成员取消参加活动
	 * @param {Number} id:活动id
	 * @return {JSON}
	 * <pre>{
	 *		msg: cancel success  
	 * }</pre>
	 */
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
					}).catch(next);
			});
	});

	/**
	 * POST /api/activities/end
	 * @method 发起者终止活动
	 * @param {Number}  id:活动id
	 * @return {JSON}
	 * <pre>{
	 * 		msg: end success  
	 * }</pre>
	 */
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

	/**
	 * POST /api/activities/update
	 * @method 发起者更新活动资料
	 * @param {Number}  id:活动id
	 * @param {String}  [content] 活动内容
	 * @param {Number}  [maxnum] 最大人数
	 * @param {Number}  [duration] 持续时间,单位为分钟
	 * @param {Number}  [statusid] 活动状态  0接受报名、1截止报名、2活动结束、3活动取消
	 * @param {Number}  [money] 活动费用
	 * @param {String}  [name] 活动名称
	 * @param {String}  [site] 活动地点
	 * @return {JSON}
	 * <pre>{
	 * 		msg: update success,  
	 * 		id: 6  
	 * }</pre>
	 */
	app.post('/api/activities/update', function (req, res, next) {
		var userid = 1,//req.session['userid'],
			id = req.body.id,
			content = req.body.content,
			maxnum = req.body.maxnum,
			starttime = req.body.starttime,
			duration = req.body.duration,
			statusid = req.body.statusid,
			money = req.body.money,
			name = req.body.name,
			site = req.body.site;
		Activity.forge({ 'id': id }).fetch()
			.then(function(activity) {
				activity.updateActivity(userid, content, maxnum, starttime, duration, statusid, money, name, site)
				.then(function (activity) {
					next({
						msg: 'update success',
						id: activity.get('id')
					});
				}).catch(next)
			});
	});

	/**
	 * POST /api/activities/create
	 * @method 群成员发起活动
	 * @param {Number} groupid 群id
	 * @param {String} content 活动描述
	 * @param {Number} maxnum 活动最大人数
	 * @param {Datetime} starttime 活动开始时间
	 * @param {Number} duration 活动持续时间,单位为分钟
	 * @param {Number} statusid 活动状态  0接受报名、1截止报名、2活动结束、3活动取消
	 * @param {Number} money 活动费用
	 * @param {String} name 活动名称
	 * @param {String} site 活动地点
	 * @return {JSON}
	 * <pre>{
	 * 		msg: create success,  
	 * 		id: 6  
	 * }</pre>
	 */
	app.post('/api/activities/create', function (req, res, next) {
		var userid = req.session['userid'],
			groupid = req.body.groupid,
			content = req.body.content,
			maxnum = req.body.maxnum,
			starttime = req.body.starttime,
			duration = req.body.duration,
			statusid = req.body.statusid,
			money = req.body.money,
			name = req.body.name,
			site = req.body.site;
		Activity.forge().createActivity(userid, groupid, content, maxnum, starttime, duration, statusid, money, name, site)
			.then(function (activity) {
				next({
					msg: 'create success',
					id: activity.get('id')
				});
			}).catch(next);
	});

	/**
	 * POST /api/activities/userslist
	 * @method 获取活动人员名单
	 * @param {Number} id:活动id
	 * @return {Array}
	 * <pre>{
	"users": [
			{  
			  "id": 71,  
			  "userid": 1,  
			  "activityid": 15,  
			  "isaccepted": 1,  
			  "name": "arwuba_60"  
			},  
			{  
			  "id": 72,  
			  "userid": 13,  
			  "activityid": 15,  
			  "isaccepted": 1,  
			  "name": "WTF"  
			}  
		  ]  
		}</pre>
	 */
	app.post('/api/activities/userslist', function(req, res, next) {
		var userid = req.session['userid'],
			id = req.body.id;
		Activity.forge({ 'id': id }).fetch()
			.then(function(activity) {
				activity
					.getUserList(userid)
					.then(function(users) {
						next({ users: users });
					}).catch(next);
			});
	});

	/**
	 * POST /api/activities/accept
	 * @method 发起人接受申请人
	 * @param {Number} id:userslist接口里面的那个id,不是userid
	 * @param {Number} activityid:活动id
	 * @return {JSON}
	 * <pre>{
	 * 		msg: accept success  
	 * }</pre>
	 */
	app.post('/api/activities/accept', function(req, res, next) {
		var userid = req.session['userid'],
			id = req.body.id,
			activityid = req.body.activityid;
		Activity.forge({ 'id': activityid })
			.fetch()
			.then(function(activity) {
				activity.
					acceptJoin(userid, id)
					.then(function(activity) {
						next({ msg: 'accept success' });
					}).catch(next);
			});
	});

	/**
	 * POST /api/activities/avatar/update
	 * @method 更新活动图片
	 * @param {File} avatar
	 * @return {JSON}
	 * <pre>{
	 * 		msg: avatar updated  
	 * }</pre>
	 */
	app.post('/api/activities/avatar/update', function (req, res, next) {
		if(!req.files['avatar']) return next(errors[20007]);
		var file = req.files['avatar'],
			_3M = 3 * 1024 * 1024;
		if(file['type'] != 'image/jpeg') return next(errors[20005]);
		if(file['size'] > _3M) return next(errors[20006]);
		Activity.forge({ id: req.id })
			.updateAvatar(file['path'])
			.then(function () {
				next({ msg: 'avatar updated' });
			}).catch(next);
	});
};

