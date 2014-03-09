/**
 * @class 活动
 */
var _ = require('underscore'),
	Promise = require('bluebird'),
	User = require('../models/user'),
	Activity = require('../models/activity'),
	Activities = Activity.Set,
	UserActivity = require('../models/user-activity'),
	UserActivitys = UserActivity.Set,
	GroupMembers = require('../models/group-membership'),
	Event = require('../models/event'),
	Picture = require('../models/picture'),
	errors = require('../lib/errors'),
	config = require('../config'),
	imageLimit = config.imageLimit;

module.exports = function (app) {
	/**
	 * GET /api/activities/list
	 * @method 活动列表
	 * @param {Number} [id] 活动id
	 * @param {String} [name] 活动名称
	 * @param {String} [content] 活动内容 (仅限搜索)
	 * @param {String} [site] 活动地点
	 * @return {Array}
	 * // GET /api/activities/list?id=45
	 * <pre>{
	  "activities": [
		{
		  "id": 21,
		  "ownerid": 17,
		  "groupid": 7,
		  "content": "To cica zakbufo got hakem wobe rusel zokel de",
		  "maxnum": 40,
		  "createtime": 1357600439000,
		  "starttime": 1388279716000,
		  "duration": 4,
		  "statusid": 1,
		  "avatar": "/activities/21.jpg?t=/activities/21.jpg?t=1392704568094",
		  "money": 1090,
		  "name": "gamzusiki",
		  "site": "mew",
		  "regdeadline": 1385758936000,
		  "user": {
			"id": 17,
			"username": "tem_627",
			"regtime": 1363391664000,
			"isonline": 1,
			"avatar": "/avatars/17.jpg?t=1392704564142",
			"cover": "/covers/17.jpg?t=1392704564505",
			"profile": {
			  "email": "hik@bi.net",
	 "name": "Andre Woods",
	 "gender": "m",
	 "age": 27,
	 "grade": 2002,
	 "university": "Ihodage University",
	 "major": "Hatef",
	 "summary": "Guzal modige nolege pisiko bej nuzew newcig nimehi siwla in kerlosud vatzoc bipedse do nusle pe kemcoful lasozsa.",
	 "tag": "heh,gagef,abnipar"
	 },
	 "numFollowing": 3,
	 "numFollowers": 3,
	 "numIssues": 4,
	 "numPhotos": 4,
	 "numStarring": 2,
	 "numEvents": 4,
	 "isfollowed": 0
	 },
	 "status": {
			"id": 1,
			"name": "????"
		  },
	 "numUsership": 2
	 }
	 ]
	 }
	 </pre>
	 */
	app.get('/api/activities/list', function (req, res, next) {
		Activities.forge().fetch({ req: req })
			.then(function (activities) {
				next({ activities: activities });
			}).catch(next);
	});

	/**
	 * GET /api/activities/view
	 * @method 活动详情
	 * @param {Number} id 活动ID
	 * @return {JSON}
	 */
	app.get('/api/activities/view', function (req, res, next) {
		Activity.forge({ id: req.query['id'] })
			.fetch({ req: req, detailed: true })
			.then(function (activity) {
				next({ activity: activity });
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
		UserActivitys.forge().fetch({ req: req })
			.then(function (useractivitys) {
				return useractivitys.mapThen(function (useractivity) {
					return useractivity.load(['user']);
				}).then(function (useractivitys) {
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

		if (!user) return next(errors(21301));
		if (!req.body['id']) return next(errors(10008));

		Activity.forge({ id: req.body['id'] })
			.fetch()
			.then(function (activity) {
				var statusid = activity.get('statusid');

				if (statusid == 2) throw errors(40012);
				if (statusid == 3) throw errors(40013);
				if (statusid == 4) throw errors(40014);

				return UserActivity.forge({
					'userid': user.id,
					'activityid': activity.get('id'),
					'isaccepted': false
				}).save()
					.then(function () {
						next({ msg: 'join activity success' });
					}).catch(function (err) {
						if (/^ER_DUP_ENTRY/.test(err.message)) {
							throw errors(20506);
						} else {
							throw err;
						}
					})
			}).catch(next);
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

		if (!user) return next(errors(21301));
		if (!req.body['id']) return next(errors(10008));

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
									throw errors(40016);
								return usership.destroy();
							}).then(function () {
								next({
									msg: 'cancel success'
								});
							});
					} else {
						throw errors(20603);
					}
				});
			}).catch(next);
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

		if (!user) return next(errors(21301));
		if (!req.body['id']) return next(errors(10008));
		Activity.forge(req.body)
			.fetch()
			.then(function (activity) {
				var self = activity,
					groupid = self.get('groupid');
				return self.load(['usership']).then(function (activity) {
					if (!(self.get('ownerid') == user.id)) {
						throw errors(20102);
					}
					Event.add(user.id, activity.get('groupid'), 'activity', activity.get('id'), user.related('profile').get('name') + '结束了活动' + activity.get('name'));
					return self.set({
						'statusid': 4
					}).save()
						.then(function () {
							next({
								msg: 'end success'
							});
						});
				});
			}).catch(next);
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

		if (!user) return next(errors(21301));
		if (!req.body['id'] || !req.body['content'] || !req.body['starttime'] || !req.body['duration'] || !req.body['statusid'] || !req.body['money'] || !req.body['name'] || !req.body['site'] || !req.body['regdeadline'] || !req.body['maxnum'])
			return next(errors(10008));
		Activity.forge({ 'id': req.body['id'] }).fetch()
			.then(function (activity) {
				var ownerid = activity.get('ownerid');
				if (user.id != ownerid) {
					throw errors(20102);
				}
				Event.add(user.id, activity.get('groupid'), 'activity', activity.get('id'), user.related('profile').get('name') + '更新了活动' + activity.get('name'));
				return activity.set(req.body).save()
					.then(function (activity) {
						next({
							msg: 'update success',
							id: activity.get('id')
						});
					});
			}).catch(next);
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

		if (!user) return next(errors(21301));
		delete req.body['id'];
		if (!req.body['groupid'] || !req.body['content'] || !req.body['starttime'] || !req.body['duration'] || !req.body['statusid'] || !req.body['money'] || !req.body['name'] || !req.body['site'] || !req.body['regdeadline'] || !req.body['maxnum'])
			return next(errors(10008));

		//check the dude belong to group
		GroupMembers.forge({
			'groupid': req.body['groupid'],
			'userid': user.id
		}).fetch().then(function (groupmember) {
				if (groupmember == null) throw errors(40001);
				return Activity.forge({ name: req.body['name'] })
					.fetch()
					.then(function (activity) {
						if (activity) {
							throw errors(20506);
						}
						return Activity.forge(_.extend({
							ownerid: user.id
						}, req.body)).save();
					}).then(function (activity) {
						var activityid = activity.id;
						var maxNumPic = 3;
						var p = Promise.cast();
						var keyList = new Array();
						for(var i=0; i < maxNumPic; i++) {
							keyList.push('picture' + (i + 1));
						}
						_.every(keyList, function (v, i) {
							var key = v;
							if (req.files[key]) {
								p = p.then(function () {
									return Picture.forge({ activityid: activityid }).save()
										.then(function (picture) {
											return picture.updatePicture('avatar', req.files[key]['path']);
										});
								});
								return true;
							}
						});
						return p.then(function () {
							Event.add(user.id, activity.get('groupid'), 'activity', activity.get('id'), user.related('profile').get('name') + '创建了活动' + activity.get('name'));
							return UserActivity.forge({
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

					})
			}).catch(next);
	});

	/**
	 * GET /api/activities/userslist
	 * @method 获取活动人员名单
	 * @param {Number} id 活动id
	 * @param {Boolean} [isaccepted]
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
	app.get('/api/activities/userslist', function (req, res, next) {
		var user = req.user;

		if (!user) return next(errors(21301));
		if (!req.query['id'])
			return next(errors(10008));
		Activity.forge({ id: req.query['id'] }).fetch()
			.then(function (activity) {
				if (!activity) throw errors(20603);

				return activity
					.related('usership')
					.query(function (qb) {
						if (req.query['isaccepted'])
							qb.where('isaccepted', req.query['isaccepted']);
						req.query['orders'].forEach(function (order) {
							qb.orderBy(order[0], order[1]);
						});
					}).query('offset', req.query['offset'])
					.query('limit', req.query['limit'])
					.fetch({withRelated: ['user', 'user.profile']});
			}).then(function (userships) {
				next({ userships: userships });
			}).catch(next);
	});

	/**
	 * POST /api/activities/accept
	 * @method 发起人接受申请人
	 * @param {Number} id userslist接口里面的那个id,不是userid
	 * @return {JSON}
	 * <pre>{
	 * 		msg: accept success  
	 * }</pre>
	 */
	app.post('/api/activities/accept', function (req, res, next) {
		var user = req.user;

		if (!user) return next(errors(21301));
		if (!req.body['id'])
			return next(errors(10008));

		UserActivity.forge({ id: req.body['id'] })
			.fetch()
			.then(function (usership) {
				if (!usership) throw errors(20603);
				var activityid = usership.get('activityid'),
					self = usership;
				Activity.forge({ id: activityid })
					.fetch()
					.then(function (activity) {
						ownerid = activity.get('ownerid');
						if (user.id != ownerid) return next(errors(20102));
						else return self.set({ 'isaccepted': true }).save()
							.then(function () {
								next({ msg: 'accept success' });
							});
					});
			}).catch(next)
	});

	/**
	 * POST /api/activities/reject
	 * @method 拒绝加入申请
	 * @param {Number} id
	 */
	app.post('/api/activities/reject', function (req, res, next) {

		var user = req.user;

		if (!user) return next(errors(21301));
		if (!req.body['id'])
			return next(errors(10008));

		UserActivity.forge({ id: req.body['id'] })
			.fetch()
			.then(function (usership) {
				if (!usership) throw errors(20603);
				var activityid = usership.get('activityid'),
					self = usership;
				Activity.forge({ id: activityid })
					.fetch()
					.then(function (activity) {
						ownerid = activity.get('ownerid');
						if (user.id != ownerid) return next(errors(20102));
						else return self.destroy()
							.then(function () {
								next({ msg: 'reject success' });
							});
					});
			}).catch(next)
	});

	/**
	 * GET /api/activities/my
	 * 含我加入的、我创建的活动列表。<br>
	 * 支持page、limit、orders
	 * @method 我的活动列表
	 * @return {JSON}
	 * {
		  "activities": [
			{
			  "id": 21,
			  "ownerid": 23,
			  "groupid": 7,
			  "content": "Pow falgubmog koto ipi dolfa ejeszu denbobsu ",
			  "maxnum": 23,
			  "createtime": 1357238824000,
			  "starttime": 1382140926000,
			  "duration": 8,
			  "statusid": 1,
			  "avatar": "/activities/21.jpg?t=/activities/21.jpg?t=1392382972587",
			  "money": 1020,
			  "name": "pu",
			  "site": "vejeora",
			  "regdeadline": 1367694216000,
			  "user": {
				"id": 23,
				"username": "ohoc_486",
				"regtime": 1370380697000,
				"isonline": 1,
				"avatar": "/avatars/23.jpg?t=1392382969116",
				"cover": "/covers/23.jpg?t=1392382969500",
				"profile": {
				  "email": "op@veam.org",
	 "name": "Jaiden Gardner",
	 "gender": "m",
	 "age": 56,
	 "grade": 1973,
	 "university": "Weavuga University",
	 "major": "Wa",
	 "summary": "Mebliho cuutras re tiehoma gin hopagiz ku uvo ume ho hogehin wuwode lis obouj eravu zecu jepuwrow nocse.",
	 "tag": "mupep,bar,uvfekat"
	 }
	 },
	 "_pivot_userid": 3,
	 "_pivot_activityid": 21,
	 "numUsership": 4
	 }
	 ]
	 }
	 */

	app.get('/api/activities/my', function (req, res, next) {
		var user = req.user;

		if (!user) return next(errors(21301));
		user.related('activities')
			.query(function (qb) {
				req.query['orders'].forEach(function (order) {
					qb.orderBy(order[0], order[1]);
				});
			}).query('offset', req.query['offset'])
			.query('limit', req.query['limit'])
			.fetch()
			.then(function (activities) {
				return activities.mapThen(function (activity) {
					activity.countUsership();
					return activity.load(['user', 'user.profile', 'status']);
				}).then(function (activities) {
						next({ activities: activities });
					})
			}).catch(next);
	});


	/**
	 * POST /api/activities/avatar/update
	 * @method 更新活动图片
	 * @param {Number} id 活动ID
	 * @param {File} avatar
	 * @return {JSON}
	 * <pre>{
	 * 		msg: avatar updated  
	 * }</pre>
	 */
	app.post('/api/activities/avatar/update', function (req, res, next) {
		if (!req.files['avatar']) return next(errors(20007));
		var user = req.user,
			file = req.files['avatar'];
		if (!user) return next(errors(21301));
		if (!req.body['id']) return next(errors(10008));
		if (file['type'] != 'image/jpeg') return next(errors(20005));
		if (file['size'] > imageLimit) return next(errors(20006));
		Activity.forge({ id: req.body['id'] }).fetch()
			.then(function (activity) {
				Event.add(user.id, activity.get('groupid'), 'activity', activity.get('id'), user.related('profile').get('name') + '更新了活动' + activity.get('name'));
				return activity.updateAsset('avatar', file['path'])
					.then(function () {
						next({ msg: 'avatar updated' });
					});
			}).catch(next);
	});
};
