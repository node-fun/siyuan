var _ = require('underscore'),
	Promise = require('bluebird'),
	Cooperation = require('../models/cooperation'),
	UserCooperations = require('../models/user-cooperation'),
	CoComment = require('../models/co-comment'),
	errors = require('../lib/errors');

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
	  "deadline": "2013-02-03 01:24:43.364",
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
		Cooperation.find(req.query)
			.then(function (cooperations) {
				cooperations.mapThen(function (cooperation) {
					return cooperation.load(['status', 'user', 'user.profile']);
				})
				.then(function (cooperations) {
					next({
						cooperations: cooperations
					});
				});

			}).catch(next);
	});


	/**
	 * GET /api/cooperations/history
	 * @method 参加合作历史
	 * @param {Number} [id] 申请id,就是usership的id
	 * @param {Number} [userid] 用户ID
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
		UserCooperations.find(req.query)
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
	app.post('/api/cooperations/join', function(req, res, next) {
		var userid = req.session['userid'];
		Cooperation.forge(req.body)
			.fetch().
			then(function (cooperation) {
				return cooperation.joinCooperation(userid)
					.then(function (usership) {
						next({
							msg: 'join success',
							id: usership.get('id')
						});
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
		var userid = req.session['userid'];
			id = req.body.id;
		Cooperation.forge({ 'id': id })
			.fetch()
			.then(function (cooperation) {
				return cooperation.cancelCooperation(userid)
					.then(function () {
						next({
							msg: 'cancel success'
						});
					})
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
		var userid = req.session['userid'],
			id = req.body.id;
		Cooperation.forge({ 'id': id })
			.fetch()
			.then(function (cooperation) {
				if (cooperation == null) {
					return Promise.rejected(errors[40018]);
				}
				return cooperation.endCooperation(userid)
					.then(function () {
						next({
							msg: 'end success'
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
	 * @param {DATETIME} deadline 合作期限
	 * @param {Number} statusid 1发布 2结束
	 * @return {Array}
	 * <pre>
	 *     {
	 *     		msg: update success,
	 *     		id: 6
	 *     }
	 * </pre>
	 */
	app.post('/api/cooperations/update', function(req, res, next) {
		var userid = 1,//req.session['userid'],
			id = req.body.id,
			name = req.body.name,
			description = req.body.description,
			company = req.body.company,
			deadline = req.body.deadline,
			statusid = req.body.statusid,
			isprivate = req.body.isprivate;
		Cooperation.forge({ 'id': id }).fetch()
			.then(function (cooperation) {
				return cooperation.updateCooperation(userid, name, description, company, deadline, statusid, isprivate)
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
	 * @param {String} deadline 合作期限
	 * @param {Number} statusid 1发布 2结束
	 * @param {BOOLEAN} isprivate 是否私有
	 * @return {JSON}
	 * <pre>
	 *     {
	 *     		msg: create success,
	 *     		id: 6
	 *     }
	 * </pre>
	 */
	app.post('/api/cooperations/create', function(req, res, next) {
		var ownerid = req.session['userid'],
			name = req.body.name,
			description = req.body.description,
			company = req.body.company,
			deadline = req.body.deadline,
			statusid = req.body.statusid,
			isprivate = req.body.isprivate;
		Cooperation.forge().createCooperation(ownerid, name, description, company, deadline, statusid, isprivate)
			.then(function (cooperation) {
				next({
					msg: 'create success',
					id: cooperation.get('id')
				});
			}).catch(next);
	});

	/**
	 * POST /api/cooperations/userlist
	 * @method 获取合作人员名单
	 * @param {Number} id 合作ID
	 * @return {Array}
	 * <pre>{
  "users": [
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
	app.get('/api/cooperations/userlist', function (req, res, next) {
		var id = req.body.id;
		Cooperation.forge({ 'id': id }).fetch()
			.then(function (cooperation) {
				return cooperation.getUserList()
					.then(function (users) {
						next({
							users: users
						});
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
		var userid = req.session['userid'],
			id = req.body.id,
			cooperationid = req.body.cooperationid;
		Cooperation.forge({ 'id': cooperationid })
			.fetch()
			.then(function (cooperation) {
				return cooperation.acceptJoin(userid, id)
					.then(function (cooperation) {
						next({ msg: 'accept success' });
					});
			}).catch(next);
	});

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
			}).then(function () {
				next({
					msg: 'Coment updated'
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

}