/**
 * @class 商务合作
 */
var _ = require('underscore'),
	Promise = require('bluebird'),
	User = require('../models/user'),
	Cooperation = require('../models/cooperation'),
	Cooperations = Cooperation.Set,
	UserCooperation = require('../models/user-cooperation'),
	GroupMember = require('../models/group-membership'),
	GroupMembers = GroupMember.Set,
	CoComment = require('../models/co-comment'),
	errors = require('../lib/errors'),
	config = require('../config'),
	imageLimit = config.imageLimit;

module.exports = function (app) {
	/**
	 * GET /api/cooperations/find
	 * @method 合作列表
	 * @param {Number} [id] 合作ID
	 * @param {String} [name] 合作名称
	 * @return {Array}
	 * // GET /api/cooperations/find?id=20
	 *
	 * <pre>{
	 * "cooperations": [
	 {
	  "id": 1,
	  "name": "ur",
	  "ownerid": 5,
	  "description": "Pec jeffo zewbugni bokzifvik ollu volsoz wane",
	  "company": "wos",
	  "avatar": "atijev",
	  "statusid": 1,
	  "isprivate": 1,
	  "user": {
		"id": 5,
		"username": "odeikzop_57",
		"regtime": 1363814596000,
		"isonline": 1,
		"profile": {
		  "email": "fu@donzog.co.uk",
	 "nickname": "London George",
	 "name": "Adriana Montgomery",
	 "gender": "m",
	 "age": 57,
	 "grade": 1972,
	 "university": "Ikhilo University",
	 "major": "Cagok"
	 },
	 "avatar": "/avatars/5.jpg"
	 },
	 "status": {
        "id": 1,
        "name": "??"
      }
	 }
	 ]
	 }</pre>
	 */
	app.get('/api/cooperations/find', function (req, res, next) {
		Cooperations.list(req.query, Cooperations.finder)
			.then(function (cooperations) {
				next({
					cooperations: cooperations
				});
			}).catch(next);
	});

	/**
	 * GET /api/cooperations/search
	 * @method 合作搜索
	 * @param {Number} [ownerid] 作者ID
	 * @param {String} [name] 标题关键字
	 * @param {String} [description] 内容关键字
	 * @return {JSON}
	 */
	app.get('/api/cooperations/search', function (req, res, next) {
		Cooperations.list(req.query, Cooperations.searcher)
			.then(function (cooperations) {
				next({ cooperations: cooperations });
			}).catch(next);
	});

	/**
	 * GET /api/cooperations/view
	 * @method 合作详情
	 * @param {Number} id 合作ID
	 * @return {JSON}
	 */
	app.get('/api/cooperations/view', function (req, res, next) {
		Cooperation.view(req.query)
			.then(function (cooperation) {
				next({ cooperation: cooperation});
			}).catch(next);
	});

	/**
	 * GET /api/cooperations/history
	 * @method 参加合作历史
	 * @param {Number} [id] 申请id,就是usership的id
	 * @param {Number} [ownerid] 用户ID
	 * @param {Number} [cooperationid] 合作ID
	 * @return {Array}
	 * <pre>{
		  "usership": [
			{
			  "id": 7,
			  "userid": 31,
			  "cooperationid": 11,
			  "isaccepted": 0,
			  "user": {
				"id": 31,
				"username": "mo_168",
				"regtime": 1374861840000,
				"isonline": 0,
				"avatar": "/avatars/31.jpg"
			  }
			}
		  ]
		}</pre>
	 */
	app.get('/api/cooperations/history', function (req, res, next) {
		UserCooperation.find(req.query)
			.then(function (usercooperations) {
				usercooperations.mapThen(function (usercooperation) {
					return usercooperation.load(['user']);
				})
					.then(function (usercooperations) {
						next({
							usership: usercooperations
						});
					})
			}).catch(next);
	});

	/**
	 * POST /api/cooperations/join
	 * @method 加入合作
	 * @param {Number} id 合作ID
	 * @return {JSON}
	 * <pre>
	 *     {
	 *     		msg: join success
	 *     		id: 6
	 *     }
	 * </pre>
	 */
	app.post('/api/cooperations/join', function (req, res, next) {
		var user = req.user;

		if (!user) return next(errors[21301]);
		if (!req.body['id']) return next(errors[10008]);
		Cooperation.forge({ id: req.body['id'] })
			.fetch().
			then(function (cooperation) {

				//check the cooperation isprivate
				var self = cooperation,
					isprivate = self.get('isprivate'),
					id = self.get('id'),
					ownerid = self.get('ownerid');

				var isfounded = false,
					theGroupid = [];

				//check if already apply
				return UserCooperation.forge({
					'userid': user.id,
					'cooperationid': id
				}).fetch()
					.then(function (usercooperation) {
						if (usercooperation != null) return Promise.rejected(errors[40002]);
						if (!isprivate) {
							UserCooperation.forge({
								'userid': user.id,
								'cooperationid': id,
								'isaccepted': false
							}).save()
								.then(function (usership) {
									next({
										msg: 'join success',
										id: usership.get('id')
									});
								});
						} else {
							//check the user if in the same group
							return GroupMembers.forge()
								.query(function (qb) {
									qb.where('userid', ownerid);
								}).fetch()
								.then(function (groupmembers) {
									return groupmembers.mapThen(function (groupmember) {
										var groupid = groupmember.get('groupid');
										return GroupMember.forge({
											'userid': user.id,
											'groupid': groupid
										}).fetch()
											.then(function (groupmember) {
												if (groupmember != null) {
													isfounded = true;
													theGroupid.push(groupmember.get('groupid'));
												}
											});
									}).then(function (groupmembers) {
											if (!isfounded) return Promise.rejected(errors[21301]);
											return UserCooperation.forge({
												'userid': user.id,
												'cooperationid': id,
												'isaccepted': false
											}).save()
												.then(function (usership) {
													next({
														msg: 'join success',
														id: usership.get('id')
													});
												});
										});
								});
						}
					});
			}).catch(next);
	});

	/**
	 * POST /api/cooperations/cancel
	 * @method 成员取消参加合作
	 * @param {Number} id 合作ID
	 * @return {JSON}
	 * <pre>
	 * {
	 * 		msg: cancel success
	 * }
	 * </pre>
	 */
	app.post('/api/cooperations/cancel', function (req, res, next) {
		var user = req.user;

		if (!user) return next(errors[21301]);
		if (!req.body['id']) return next(errors[10008]);
		Cooperation.forge({ 'id': req.body['id'] })
			.fetch()
			.then(function (cooperation) {
				if (cooperation == null) next(20603);
				var self = cooperation;
				self.load(['usership']).then(function (cooperation) {
					var userships = cooperation.related('usership').models,
						isfounded = false;
					_.each(userships, function (usership) {
						if (usership.get('userid') == user.id) {
							isfounded = true;
						}
					});
					if (isfounded)
						return UserCooperation.forge({
							'userid': user.id,
							'cooperationid': self.get('id')
						}).fetch()
							.then(function (usership) {
								if (usership.get('isaccepted') == 1)
									return Promise.rejected(errors[40016]);
								return usership.destroy()
									.then(function () {
										next({
											msg: 'cancel success'
										});
									});
							})
					else
						return Promise.rejected(errors[20605]);
				});
			}).catch(next);
	});

	/**
	 * POST /api/cooperations/end
	 * @method 发起者终止合作
	 * @param {Number} id 合作ID
	 * @return {JSON}
	 * <pre>
	 *     {
	 *     		msg: end success
	 *     }
	 * </pre>
	 */
	app.post('/api/cooperations/end', function (req, res, next) {
		var user = req.user;

		if (!user) return next(errors[21301]);
		if (!req.body['id']) return next(errors[10008]);
		Cooperation.forge({ 'id': req.body['id'] })
			.fetch()
			.then(function (cooperation) {
				if (cooperation == null) {
					return Promise.rejected(errors[20603]);
				}
				var self = cooperation;
				return self.load(['usership']).then(function () {
					if (!(self.get('ownerid') == user.id)) {
						return Promise.rejected(errors[20102]);
					}
					return self.set({
						'statusid': 2
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
	 * POST /api/cooperations/update
	 * @method 发起者更新合作资料
	 * @param {Number} id 合作ID
	 * @param {String} name 合作名称
	 * @param {String} description 合作简介
	 * @param {String} company 公司或组织
	 * @param {Number} statusid 1发布 2结束
	 * @param {DATETIME} [regdeadline] 合作截止时间
	 * @return {Array}
	 * <pre>
	 *     {
	 *     		msg: update success,
	 *     		id: 6
	 *     }
	 * </pre>
	 */
	app.post('/api/cooperations/update', function (req, res, next) {
		var user = req.user;

		if (!user) return next(errors[21301]);
		if (!req.body['id'] || !req.body['name'] || !req.body['description'] || !req.body['company'] || !req.body['statusid'] || !req.body['isprivate'] || !req.body['regdeadline'])
			return next(errors[10008]);
		Cooperation.forge({ 'id': req.body['id'] }).fetch()
			.then(function (cooperation) {
				var self = cooperation;
				var ownerid = cooperation.get('ownerid');
				if (user.id != ownerid) {
					return Promise.rejected(errors[20102]);
				}
				self.set(req.body).save()
					.then(function (cooperation) {
						next({
							msg: 'update success',
							id: cooperation.get('id')
						});
					});
			}).catch(next);
	});

	/**
	 * POST /api/cooperations/create
	 * @method 发起合作
	 * @param {String} name 合作名称
	 * @param {String} description 合作简介
	 * @param {String} company 公司或组织
	 * @param {Number} statusid 1发布 2结束
	 * @param {BOOLEAN} isprivate 是否私有
	 * @param {DATETIME} regdeadline 合作截止时间
	 * @return {JSON}
	 * <pre>
	 *     {
	 *     		msg: create success,
	 *     		id: 6
	 *     }
	 * </pre>
	 */
	app.post('/api/cooperations/create', function (req, res, next) {
		var user = req.user;

		if (!user) return next(errors[21301]);
		if (!req.body['name'] || !req.body['description'] || !req.body['company'] || !req.body['statusid'] || !req.body['isprivate'] || !req.body['regdeadline'])
			return next(errors[10008]);

		Cooperation.forge(_.extend({
				ownerid: user.id
			}, req.body)).save()
			.then(function (cooperation) {
				return UserCooperation.forge({
					userid: user.id,
					cooperationid: cooperation.get('id'),
					isaccepted: true
				}).save().then(function (usercooperation) {
						next({
							msg: 'create success',
							id: cooperation.get('id'),
							isprivate: cooperation.get('isprivate')
						});
					});
			}).catch(next);
	});

	/**
	 * POST /api/cooperations/userslist
	 * @method 获取合作人员名单
	 * @param {Number} id 合作ID
	 * @return {Array}
	 * <pre>{
  "userships": [
    {
      "id": 11,
      "userid": 14,
      "cooperationid": 12,
      "isaccepted": 0,
      "name": "nonteg_926"
    },
    {
      "id": 28,
      "userid": 1,
      "cooperationid": 12,
      "isaccepted": 0,
      "name": "eje_95"
    },
    {
      "id": 33,
      "userid": 15,
      "cooperationid": 12,
      "isaccepted": 0,
      "name": "ji_104"
    },
    {
      "id": 70,
      "userid": 12,
      "cooperationid": 12,
      "isaccepted": 0,
      "name": "ca_938"
    },
    {
      "id": 78,
      "userid": 24,
      "cooperationid": 12,
      "isaccepted": 0,
      "name": "niz_742"
    }
  ]
}</pre>
	 */
	app.post('/api/cooperations/userslist', function (req, res, next) {
		var user = req.user;

		if (!user) return next(errors[21301]);
		if (!req.body['id'])
			return next(errors[10008]);
		Cooperation.forge({ 'id': req.body['id'] }).fetch()
			.then(function (cooperation) {

				var self = cooperation,
					id = self.get('id');
				return self.load(['usership']).then(function (cooperation) {
					var userships = cooperation.related('usership');
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
			}).catch(next);
	});

	/**
	 * POST /api/cooperations/accept
	 * @method 发起人接受申请人
	 * @param {Number} id userslist接口里面的那个id,不是userid
	 * @param {Number} cooperationid 合作ID
	 * @return {JSON}
	 * <pre>
	 *    {
	 *    		msg: accept success
	 *    }
	 * </pre>
	 */
	app.post('/api/cooperations/accept', function (req, res, next) {
		var user = req.user;

		if (!user) return next(errors[21301]);
		if (!req.body['id'] || !req.body['cooperationid'])
			return next(errors[10008]);
		Cooperation.forge({ 'id': req.body['cooperationid'] })
			.fetch()
			.then(function (cooperation) {
				var self = cooperation,
					ownerid = self.get('ownerid');
				if (user.id != ownerid) return Promise.rejected(errors[20102]);
				return UserCooperation.forge({ 'id': req.body['id'] }).fetch()
					.then(function (usership) {
						return usership.set({ 'isaccepted': true }).save();
					}).then(function () {
						next({ msg: 'accept success' });
					});
			}).catch(next);
	});


	/**
	 * GET /api/cooperations/my
	 * 含我加入的、我创建的合作列表。<br>
	 * 支持page、limit、orders
	 * @method 我的合作列表
	 * @return {JSON}
	 * {
		  "cooperations": [
			{
			  "id": 17,
			  "name": "gama",
			  "ownerid": 6,
			  "description": "Ikosod tueb enrone ap pujupewuz ikufuet defoz",
			  "company": "jopwi",
			  "avatar": "/cooperations/17.jpg?t=/cooperations/17.jpg?t=1392382983891",
			  "statusid": 1,
			  "isprivate": 0,
			  "regdeadline": 1365911718000,
			  "user": {
				"id": 6,
				"username": "cergefzot_796",
				"regtime": 1365303171000,
				"isonline": 1,
				"avatar": "/avatars/6.jpg?t=1392382969093",
				"cover": "/covers/6.jpg?t=1392382969232",
				"profile": {
				  "email": "rogda@ebka.edu",
	 "name": "Ezekiel Carroll",
	 "gender": "f",
	 "age": 52,
	 "grade": 1980,
	 "university": "Ijukubo University",
	 "major": "Monwuza",
	 "summary": "Wiwumbeg tu kav rizoel zawrem ipbanib rem fa osiko consah gadano uhomak ta agugupdif ulirehgo gorcamu etfeup.",
	 "tag": "bafferul,zoz,liletose"
	 }
	 },
	 "_pivot_userid": 3,
	 "_pivot_cooperationid": 17,
	 "numUsership": 4,
	 "numComments": 6
	 }
	 ]
	 }
	 */
	app.get('/api/cooperations/my', function (req, res, next) {
		var user = req.user;

		if (!user) return next(errors[21301]);
		user.related('cooperations')
			.query(function (qb) {
				req.query['orders'].forEach(function (order) {
					qb.orderBy(order[0], order[1]);
				});
			}).query('offset', req.query['offset'])
			.query('limit', req.query['limit'])
			.fetch()
			.then(function (cooperations) {
				cooperations.mapThen(function (cooperation) {
					return cooperation.countUsership()
						.then(function () {
							return cooperation.countComments();
						}).then(function () {
							return cooperation.load(['user', 'user.profile', 'status']);
						})
				}).then(function (cooperations) {
						next({ cooperations: cooperations });
					})
			}).catch(next);
	});

	/**
	 * @method 评论列表
	 * @param {Number} [id] 评论ID
	 * @param {Number} [cooperationid] 合作ID
	 * @param {Number} [userid] 用户ID
	 * @return {JSON}
	 * {
	 * 		cocomments: []
	 * }
	 */
	app.get('/api/cooperations/comments/find', function (req, res, next) {
		CoComment.find(req.query)
			.then(function (cocomments) {
				next({
					cocomments: cocomments
				});
			}).catch(next);
	})

	/**
	 * POST /api/cooperations/comments/post
	 * @method 评论合作
	 * @param {Number} cooperationid 合作ID
	 * @param {String} body 内容
	 * @return {JSON}
	 * <pre>
	 *     {
	 *     		msg: Comment posted
	 *     }
	 * </pre>
	 */
	app.post('/api/cooperations/comments/post', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		Cooperation.forge({ 'id': req.body['cooperationid'] }).fetch()
			.then(function (cooperation) {
				if (!cooperation) return Promise.rejected(errors[20603]);
				req.body['userid'] = user.id;
				return CoComment.forge(req.body).save();
			}).then(function (cocomment) {
				next({
					msg: 'Comment posted',
					id: cocomment.id
				});
			}).catch(next);
	});

	/**
	 * POST /api/cooperations/comments/update
	 * @method 更新评论
	 * @param {Number} id 评论ID
	 * @param {String} [body] 内容
	 * @return {JSON}
	 * <pre>
	 *     {
	 *     		msg: Coment updated
	 *     }
	 * </pre>
	 */
	app.post('/api/cooperations/comments/update', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		var id = req.body['id'];
		delete req.body['id'];
		CoComment.forge({ 'id': id }).fetch()
			.then(function (cocomment) {
				if (!cocomment) return Promise.rejected(errors[20603]);
				if (cocomment.get('userid') != user.id) {
					return Promise.rejected(errors[20102]);
				}
				return cocomment.set(req.body).save();
			}).then(function (cooperation) {
				next({
					msg: 'Coment updated',
					id: cooperation.get('id'),
					isprivate: cooperation.get('isprivate')
				});
			}).catch(next);
	});

	/**
	 * POST /api/cooperations/comments/delete
	 * @method 删除评论
	 * @param {Number} id 评论ID
	 * @return {JSON}
	 * <pre>
	 *     {
	 *     		msg: Comment deleted
	 *     }
	 * </pre>
	 */
	app.post('/api/cooperations/comments/delete', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		CoComment.forge({ 'id': req.body['id'] }).fetch()
			.then(function (cocomment) {
				if (!cocomment) return Promise.rejected(errors[20603]);
				if (cocomment.get('userid') != user.id) {
					return Promise.rejected(errors[20102]);
				}
				return cocomment.destroy();
			}).then(function () {
				next({ msg: 'Comment deleted' });
			}).catch(next);
	});

	/**
	 * POST /api/cooperations/avatar/update
	 * @method 更新合作图片
	 * @param {File} avatar
	 * @return {JSON}
	 * <pre>
	 *     {
	 *     		msg: avatar updated
	 *     }
	 * </pre>
	 */
	app.post('/api/cooperations/avatar/update', function (req, res, next) {
		if (!req.files['avatar']) return next(errors[20007]);
		var user = req.user,
			file = req.files['avatar'];
		if (!user) return next(errors[21301]);
		if (!req.body['id']) return next(errors[10008]);
		if (file['type'] != 'image/jpeg') return next(errors[20005]);
		if (file['size'] > imageLimit) return next(errors[20006]);
		Cooperation.forge({ id: req.body['id'] }).fetch()
			.then(function (cooperation) {
				cooperation.updateAsset('avatar', file['path'])
					.then(function () {
						next({ msg: 'avatar updated' });
					}).catch(next);
			})
	});

}