/**
 * @class 活动
 */
var _ = require('underscore'),
	User = require('../models/user'),
	Activity = require('../models/activity'),
	UserActivity = require('../models/user-activity'),
	GroupMembers = require('../models/group-membership'),
	Group = require('../models/group'),
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
      "ownerid": 6,
      "groupid": 4,
      "content": "Lemkazvu fegubezu gow venneg vec vukonmic gac",
      "maxnum": 34,
      "createtime": 1358884697000,
      "starttime": 1367641060000,
      "duration": 10,
      "statusid": 3,
      "avatar": "avecu",
      "money": 813,
      "name": "wojomsa",
      "site": "jabe",
      "user": {
        "id": 6,
        "username": "be_689",
        "regtime": 1377558747000,
        "isonline": 1,
        "profile": {
          "email": "lakzaki@te.co.uk",
	 "nickname": "Xander Schneider",
	 "name": "Alexandria Carlson",
	 "gender": "f",
	 "age": 26,
	 "grade": 2006,
	 "university": "Donhegra University",
	 "major": "Vormiwi"
	 },
	 "avatar": "/avatars/6.jpg"
	 },
	 "status": {
        "id": 3,
        "name": "????"
      },
	 "numUsership": 2
	 }
	 ]
	 }</pre>
	 */
	app.get('/api/activities/find', function (req, res, next) {
		Activity.find(req.query)
			.then(function (activities) {
				next({
					activities: activities
				});
			}).catch(next);
	});

	/**
	 * GET /api/activities/search
	 * @method 活动搜索
	 * @param {Number} [ownerid] 作者ID
	 * @param {String} [name] 标题关键字
	 * @param {String} [content] 内容关键字
	 * @return {JSON}
	 */
	app.get('/api/activities/search', function (req, res, next) {
		Activity.search(req.query)
			.then(function (activities) {
				next({ activities: activities });
			});
	});

	/**
	 * GET /api/activities/history
	 * @method 活动参加历史
	 * @param {Number} [id] 申请id,就是usership的id
	 * @param {Number} [userid] 用户id
	 * @param {Number} [activityid] 活动id
	 * @return {Array}
	 * <pre>{
  "usership": [
    {
      "id": 1,
      "userid": 27,
      "activityid": 5,
      "isaccepted": 0,
      "user": {
        "id": 27,
        "username": "mi_132",
        "regtime": 1376071590000,
        "isonline": 0,
        "avatar": "/avatars/27.jpg"
      }
    },
    {
      "id": 2,
      "userid": 26,
      "activityid": 4,
      "isaccepted": 1,
      "user": {
        "id": 26,
        "username": "na_954",
        "regtime": 1372878494000,
        "isonline": 1,
        "avatar": "/avatars/26.jpg"
      }
    }
    ]</pre>
	*/
	app.get('/api/activities/history', function (req, res, next) {
		UserActivity.find(req.query)
			.then(function (useractivitys) {
				useractivitys.mapThen(function (useractivity) {
					return useractivity.load(['user']);
				})
					.then(function (useractivitys) {
						next({
							usership: useractivitys
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
		var user = req.user;

		if (!user) next(errors[21301]);
		if (!req.body['id'])
			next(errors[10008]);

		Activity.forge(req.body)
			.fetch()
			.then(function (activity) {
				var groupid = activity.get('groupid');
				activity.load(['usership', 'status']).then(function (activity) {
					return Group.forge({
						'id': groupid
					}).fetch()
						.then(function (group) {
							return group.load(['memberships'])
								.then(function (group) {
									var members = group.related('memberships').models;
									var isfounded = false;
									_.each(members, function (member) {
										if (member.get('userid') == user.id) {
											isfounded = true;
										}
									});
									if (!isfounded) next(errors[40001]);

									isfounded = false;//use it again
									var userships = activity.related('usership').models;
									_.each(userships, function (usership) {
										if (usership.get('userid') == user.id) {
											isfounded = true;
										}
									});
									if (isfounded) next(errors[40002]);

									var statusid = activity.related('status').get('id');
									if (statusid == 2) next(errors[40012]);
									if (statusid == 3) next(errors[40013]);
									if (statusid == 4) next(errors[40014]);

									if (statusid == 1) {
										return UserActivity.forge({
											'userid': user.id,
											'activityid': activity.get('id'),
											'isaccepted': false
										}).save()
											.then(function (usership) {
												next({
													msg: 'join success',
													id: usership.get('id')
												});
											});
									} else {
										next(errors[40015]);
									}
								})
						});
				});
			});
	});

	/**
	 * POST /api/activities/cancel
	 * @method 成员取消参加活动
	 * @param {Number} id 活动id
	 * @return {JSON}
	 * <pre>{
	 *		msg: cancel success  
	 * }</pre>
	 */
	app.post('/api/activities/cancel', function (req, res, next) {
		var user = req.user;

		if (!user) next(errors[21301]);
		if (!req.body['id'])
			next(errors[10008]);

		Activity.forge(req.body)
			.fetch()
			.then(function (activity) {

				var self = activity;

				return self.load(['usership']).then(function (activity) {
					var userships = activity.related("usership").models;
					isfounded = false;
					_.each(userships, function (usership) {
						if (usership.get('userid') == user.id) {
							isfounded = true;
						}
					});
					if (isfounded) {
						return UserActivity.forge({
							'userid': user.id,
							'activityid': self.get('id')
						}).fetch().then(function (usership) {
								if (usership.get('isaccepted') == 1)
									next(errors[40016]);
								return usership.destroy();
							}).then(function () {
								next({
									msg: 'cancel success'
								});
							});
					} else {
						next(errors[20603]);
					}
				});
			});
	});

	/**
	 * POST /api/activities/end
	 * @method 发起者终止活动
	 * @param {Number}  id 活动id
	 * @return {JSON}
	 * <pre>{
	 * 		msg: end success  
	 * }</pre>
	 */
	app.post('/api/activities/end', function (req, res, next) {
		var user = req.user;

		if (!user) next(errors[21301]);
		if (!req.body['id'])
			next(errors[10008]);
		Activity.forge(req.body)
			.fetch()
			.then(function (activity) {
				var self = activity,
					groupid = self.get('groupid');
				self.load(['usership']).then(function (activity) {
					if (!(self.get('ownerid') == user.id)) {
						next(errors[20102]);
					}
					self.set({
						'statusid': 4
					}).save()
						.then(function () {
							next({
								msg: 'end success'
							});
						});
				});
			});
	});

	/**
	 * POST /api/activities/update
	 * @method 发起者更新活动资料
	 * @param {Number}  id:活动id
	 * @param {String}  content 活动内容
	 * @param {Number}  maxnum 最大人数
	 * @param {Number}  duration 持续时间,单位为天
	 * @param {DATETIME} starttime 活动开始时间
	 * @param {Number}  statusid 活动状态  1接受报名、2截止报名、3活动结束、4活动取消
	 * @param {Number}  money 活动费用
	 * @param {String}  name 活动名称
	 * @param {String}  site 活动地点
	 * @param {DATETIME} regdeadline 活动截止时间
	 * @return {JSON}
	 * <pre>{
	 * 		msg: update success,  
	 * 		id: 6  
	 * }</pre>
	 */
	app.post('/api/activities/update', function (req, res, next) {
		var user = req.user;

		if (!user) next(errors[21301]);
		if (!req.body['id'] || !req.body['content'] || !req.body['starttime'] || !req.body['duration'] || !req.body['statusid'] || !req.body['money'] || !req.body['name'] || !req.body['site'] || !req.body['regdeadline'] || !req.body['maxnum'])
			next(errors[10008]);
		Activity.forge({ 'id': req.body['id'] }).fetch()
			.then(function (activity) {
				var ownerid = activity.get('ownerid');
				if (user.id != ownerid) {
					next(errors[20102]);
				}
				activity.set(req.body).save()
					.then(function (activity) {
						next({
							msg: 'update success',
							id: activity.get('id')
						});
					});
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
	 * @param {Number} statusid 活动状态  1接受报名、2截止报名、3活动结束、4活动取消
	 * @param {Number} money 活动费用
	 * @param {String} name 活动名称
	 * @param {String} site 活动地点
	 * @param {DATETIME} regdeadline 活动截止时间
	 * @return {JSON}
	 * <pre>{
	 * 		msg: create success,  
	 * 		id: 6  
	 * }</pre>
	 */
	app.post('/api/activities/create', function (req, res, next) {
		var user = req.user;

		if (!user) next(errors[21301]);
		if (!req.body['groupid'] || !req.body['content'] ||
			!req.body['starttime'] || !req.body['duration'] ||
			!req.body['statusid'] || !req.body['money'] ||
			!req.body['name'] || !req.body['site'] ||
			!req.body['regdeadline'] || !req.body['maxnum'])
			next(errors[10008]);

		//check the dude belong to group
		GroupMembers.forge({
			'groupid': req.body['groupid'],
			'userid': user.id
		}).fetch().then(function (groupmember) {
				if (groupmember == null) next(errors[40001]);
				Activity.forge({ name: req.body['name'] })
					.fetch()
					.then(function (activity) {
						if (activity) {
							next(errors[20506]);
						}
						return Activity.forge(_.extend({
							ownerid: user.id
						}, req.body)).save();
					}).then(function (activity) {
						UserActivity.forge({
							'userid': user.id,
							'activityid': activity.id,
							'isaccepted': 1
						}).save()
							.then(function (usership) {
								next({
									msg: 'create success',
									id: usership.get('activityid')
								});
							});
					})
			});
	});

	/**
	 * POST /api/activities/userslist
	 * @method 获取活动人员名单
	 * @param {Number} id 活动id
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
	app.post('/api/activities/userslist', function (req, res, next) {
		var user = req.user;

		if (!user) next(errors[21301]);
		if (!req.body['id'])
			next(errors[10008]);

		Activity.forge({ 'id': req.body['id'] }).fetch()
			.then(function (activity) {
				if (!activity) next(errors[20603]);

				var self = activity;

				return self.load(['usership']).then(function (activity) {
					var userships = activity.related('usership');
					return userships.mapThen(function (usership) {
						return User.forge({ 'id': usership.get('userid') })
							.fetch()
							.then(function (user) {
								return user.load(['profile']).then(function (user) {
									return usership.set({
										'user': user
									});
								});
							});
					}).then(function (userships) {
							return userships;
						});
				}).then(function (users) {
						next({ userships: users });
					});
			});
	});

	/**
	 * POST /api/activities/accept
	 * @method 发起人接受申请人
	 * @param {Number} id userslist接口里面的那个id,不是userid
	 * @param {Number} activityid 活动id
	 * @return {JSON}
	 * <pre>{
	 * 		msg: accept success  
	 * }</pre>
	 */
	app.post('/api/activities/accept', function (req, res, next) {
		var user = req.user;

		if (!user) next(errors[21301]);
		if (!req.body['id'] || !req.body['activityid'])
			next(errors[10008]);

		Activity.forge({ 'id': req.body['activityid'] })
			.fetch()
			.then(function (activity) {
				if (!activity) next(errors[20603]);
				var self = activity,
					ownerid = self.get('ownerid');
				if (user.id != ownerid) next(errors[20102]);
				return UserActivity.forge({ 'id': req.body['id'] }).fetch()
					.then(function (usership) {
						if (!usership) next(errors[20603]);
						return usership.set({ 'isaccepted': true }).save()
							.then(function (activity) {
								next({ msg: 'accept success' });
							});
					});
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
		if (!req.files['avatar']) return next(errors[20007]);
		var file = req.files['avatar'],
			_3M = 3 * 1024 * 1024;
		if (file['type'] != 'image/jpeg') return next(errors[20005]);
		if (file['size'] > _3M) return next(errors[20006]);
		Activity.forge({ id: req.id })
			.updateAvatar(file['path'])
			.then(function () {
				next({ msg: 'avatar updated' });
			}).catch(next);
	});
};

