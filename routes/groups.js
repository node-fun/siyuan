/**
 * Created by Cam on 14-1-8.
 * @class 圈子
 */
var _ = require('underscore'),
	Group = require('../models/group'),
	GroupMember = require('../models/group-membership'),
	Event = require('../models/event'),
	errors = require('../lib/errors'),
	config = require('../config'),
	imageLimit = config.imageLimit,
	User = require('../models/user'),
	Groups = Group.Set;

module.exports = function (app) {
	/**
	 * get /api/groups/list <br>
	 * 支持page、limit、orders
	 * @method 圈子列表
	 * @param {Number} [id]
	 * @param {String} [ownerid] 创建者id
	 * @param {String} [name] 圈子名
	 * @return {JSON}
	 * 含owner,numMembers
	 */
	app.get('/api/groups/list', function (req, res, next) {
		var query = req.query,
			accepts = ['id', 'ownerid', 'name'];
		Groups.forge().query(function (qb) {
			_.each(accepts, function (k) {
				if (k in query) {
					qb.where(k, query[k]);
				}
			});
		})
			.query(function (qb) {
				req.query['orders'].forEach(function (order) {
					qb.orderBy(order[0], order[1]);
				});
			}).query('offset', req.query['offset'])
			.query('limit', req.query['limit'])
			.fetch()
			.then(function (groups) {
				return groups.mapThen(function (group) {
					return group.countMembership()
						.then(function () {
							return group.countActivities();
						}).then(function () {
							return group.load(['owner', 'owner.profile']);
						});
				}).then(function (groups) {
						next({
							groups: groups
						});
					});
			}).catch(next);
	});

	/**
	 * get /api/groups/members <br>
	 * 支持page、limit、orders
	 * @method 圈子成员列表
	 * @param {Number} id
	 * @param {BOOL} [isaccepted] 0-未通过，1-已通过， 不传值返回该圈子所有成员
	 * @return {JSON}
	 */
	app.get('/api/groups/members', function (req, res, next) {
		Group.forge({id: req.query.id})
			.fetch()
			.then(function (group) {
				return group
					.related('memberships')
					.query(function (qb) {
						req.query['orders'].forEach(function (order) {
							qb.orderBy(order[0], order[1]);
						});
						if(req.query['isaccepted'])
							qb.where('isaccepted', req.query['isaccepted']);
					}).query('offset', req.query['offset'])
					.query('limit', req.query['limit'])
					.fetch({withRelated: ['user', 'user.profile']});
			}).then(function (m) {
				next({"memberships": m});
			}).catch(next);
	})

	/**
	 * post /api/groups/members/accept <br>
	 * 管理员或圈主可以操作
	 * @method 接受加入申请
	 * @param {Number} membershipid
	 * @return {JSON}
	 */
	app.post('/api/groups/members/accept', function (req, res, next) {
		if(!req.user) return next(errors(21301));
		GroupMember.forge({id: req.body['membershipid']})
			.fetch()
			.then(function (groupMember) {
				if(!groupMember) return next(errors(20603));
				var groupid = groupMember.get('groupid');
				//判断有没有权限操作
				GroupMember.forge({groupid: groupid, userid: req.user.id})
					.fetch()
					.then(function(gm){
						if( !(gm.get('isowner') || gm.get('isadmin')) ){
							return next(errors(40017));
						}else{
							return groupMember.set('isaccepted', 1).save();
						}
					})
			}).then(function (groupMember) {
				next({msg: "group member accepted"});
			}).catch(next);
	})

	/**
	 * post /api/groups/members/reject <br>
	 * 管理员或圈主可以操作
	 * @method 拒绝加入申请
	 * @param {Number} membershipid
	 * @return {JSON}
	 */
	app.post('/api/groups/members/reject',  function (req, res, next) {
		if(!req.user) return next(errors(21301));
		GroupMember.forge({id: req.body['membershipid']})
			.fetch()
			.then(function (groupMember) {
				if(!groupMember) return next(errors(20603));//这里返回的是[Object Object]，为什么
				var groupid = groupMember.get('groupid');
				//判断有没有权限操作
				GroupMember.forge({groupid: groupid, userid: req.user.id})
					.fetch()
					.then(function(gm){
						if( !(gm.get('isowner') || gm.get('isadmin')) ){
							return next(errors(40017));
						}else{
							return groupMember.destroy();
						}
					})
			}).then(function () {
				next({msg: "group member rejected"});
			}).catch(next);
	});
	
	/**
	 * get /api/groups/activities <br>
	 * 支持page、limit、orders
	 * @method 圈子活动列表
	 * @param {Number} id
	 * @return {JSON}
	 */
	app.get('/api/groups/activities', function (req, res, next) {
		Group.forge({id: req.query.id})
			.fetch()
			.then(function (group) {
				return group
					.related('activities')
					.query(function (qb) {
						req.query['orders'].forEach(function (order) {
							qb.orderBy(order[0], order[1]);
						});
					}).query('offset', req.query['offset'])
					.query('limit', req.query['limit'])
					.fetch({withRelated: ['user', 'user.profile']});
			}).then(function (m) {
				next({"activities": m});
			}).catch(next);
	})

	/**
	 * post /api/groups/create
	 * @method 创建圈子
	 * @param {String} name 圈子名
	 * @param {String} description 描述
	 * @return {JSON}
	 * {  
	 * 　　msg: 'group created',  
	 * 　　id: group.id  
	 * }
	 */
	app.post('/api/groups/create', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors(21301));
		if (!req.body['name'] || !req.body['description']) {
			return next(errors(10008));
		}
		Group.forge(_.extend({
				ownerid: user.id
			}, req.body))
			.save()
			.then(function (group) {
				Event.add(user.id, null, 'group', group.id, user.get('username') + ' 创建了圈子' + group.get('name'));
				return GroupMember.forge({
					userid: user.id,
					groupid: group.id,
					isowner: 1
				}).save()
					.then(function (groupMember) {
						next({
							msg: 'group created',
							id: groupMember.get('groupid')
						});
					});
			})
			.catch(function (err) {
				if (/^ER_DUP_ENTRY/.test(err.message)) {
					next(errors(20506));
				} else {
					next(err);
				}
			});
	});

	/**
	 * post /api/groups/join
	 * @method 加入圈子
	 * @param {Number} groupid 圈子id
	 * @return {JSON} {  
	 * 　　msg: 'join group success'  
	 * }
	 */
	app.post('/api/groups/join', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors(21301));
		join(user, [user.id], req.body['groupid'], next);
	});

	/**
	 * post /api/groups/quit
	 * @method 退出圈子
	 * @param {Number} groupid 圈子id
	 * @return {JSON} {  
	 * 　　msg: 'quit group success'  
	 * }
	 */
	app.post('/api/groups/quit', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors(21301));
		quit(user, req.body['groupid'], next);
	});

	/**
	 * GET /api/groups/my
	 * 含我加入的、我创建的圈子列表。<br>
	 * 支持page、limit、orders
	 * @method 我的圈子列表
	 * @return {JSON}
	 {
		"groups": [
		{
			"id": 8,
			"ownerid": 40,
			"name": "test4",
			"description": "12345678",
			"createtime": 1391844645000,
			"avatar": "/groups/8.jpg",
			"owner": {
				"id": 40,
				"username": "test4",
				"regtime": 1391844558000,
				"isonline": 1,
				"avatar": null,
				"cover": null,
				"profile": {
					"email": null,
					"name": null,
					"gender": null,
					"age": null,
					"grade": null,
					"university": null,
					"major": null,
					"summary": null
				}
			},
			"numActivities": 0,
			"numMembers": 1
		}
	]
	}
	 */
	app.get('/api/groups/my', function (req, res, next) {
		if (!req.user) return next(errors(21301));
		req.user
			.related('groups')
			.query(function (qb) {
				req.query['orders'].forEach(function (order) {
					qb.orderBy(order[0], order[1]);
				});
			}).query('offset', req.query['offset'])
			.query('limit', req.query['limit'])
			.fetch()
			.then(function (groups) {
				return groups.mapThen(function (group) {
					return group.countMembership()
						.then(function () {
							return group.countActivities();
						}).then(function () {
							return group.load(['owner', 'owner.profile']);
						});
				}).then(function (groups) {
						next({groups: groups});
					});
			}).catch(next);
	});

	/**
	 * POST /api/groups/setadmin <br/>
	 * 注意：只有圈主可以设置管理员
	 * @method 设置管理员
	 * @param {Number} userid 成员的id
	 * @param {Number} groupid 圈子id
	 * @return {JSON}
	 {
		msg: "set admin success"
	}
	 */
	app.post('/api/groups/setadmin', function (req, res, next) {
		var user = req.user;
		if (!user) {
			return next(errors(21301));
		}
		GroupMember.forge({
			userid: user.id,
			groupid: req.body['groupid']
		}).fetch()
			.then(function (m) {
				if (!m.get('isowner')) {
					next(errors(21301));
				} else {
					GroupMember.forge({
						userid: req.body['userid'],
						groupid: req.body['groupid']
					})
						.fetch()
						.then(function (m) {
							m.set('isadmin', 1);
							m.save()
								.then(function () {
									next({
										msg: "set admin success"
									});
									//产生动态，但要先获取一下用户名
									User.forge({id: req.body['userid']}).fetch()
										.then(function (u) {
											Event.add(user.id, m.get('groupid'), 'group', m.get('groupid'),
												u.get('username') + ' 成为圈子管理员');
										});
								});
						});
				}
			});
	});

	/**
	 * POST /api/groups/canceladmin <br/>
	 * 注意：只有圈主可以撤销管理员
	 * @method 撤销管理员
	 * @param {Number} userid 成员的id
	 * @param {Number} groupid 圈子id
	 * @return {JSON}
	 {
		msg: "cancel admin success"
	}
	 */
	app.post('/api/groups/canceladmin', function (req, res, next) {
		var user = req.user;
		if (!user) {
			return next(errors(21301));
		}
		GroupMember.forge({
			userid: user.id,
			groupid: req.body['groupid']
		}).fetch()
			.then(function (m) {
				if (!m.get('isowner')) {
					next(errors(21301));
				} else {
					GroupMember.forge({
						userid: req.body['userid'],
						groupid: req.body['groupid']
					})
						.fetch()
						.then(function (m) {
							m.set('isadmin', 0);
							m.save()
								.then(function () {
									next({
										msg: "cancel admin success"
									});
									//产生动态，但要先获取一下用户名
									User.forge({id: req.body['userid']}).fetch()
										.then(function (u) {
											Event.add(user.id, m.get('groupid'), 'group', m.get('groupid'),
												u.get('username') + ' 被撤销圈子管理员职位');
										});
								});
						});
				}
			});
	});

	/**
	 * POST /api/groups/pull <br/>
	 * 注意：必须是管理员或圈主才能拉好友进圈子，<br/>
	 * 可以传多个userid
	 * @method 拉好友进圈子
	 * @param {Number} userid
	 * @param {Number} groupid
	 * @return {JSON}
	 {
		msg: 'join group success'
	}
	 */
	app.post('/api/groups/pull', function (req, res, next) {
		var user = req.user;
		if (!user) {
			return next(errors(21301));
		}
		GroupMember.forge({
			userid: user.id,
			groupid: req.body['groupid']
		}).fetch()
			.then(function (m) {
				if (!m.get('isadmin') && !m.get('isowner')) {
					next(errors(21301));
				} else {
					var userid = req.body['userid'];
					if (!_.isArray(userid)) {
						userid = [userid];
					}
					return join(user, userid, req.body['groupid'], next);
				}
			});
	});

	/**
	 * POST /api/groups/remove <br/>
	 * 管理员或圈主可操作
	 * @method 踢人出圈子
	 * @param {Number} userid
	 * @param {Number} groupid
	 * @return {JSON}
	 {
		msg: 'quit group success'
	}
	 */
	app.post('/api/groups/remove', function (req, res, next) {
		var user = req.user;
		if (!user) {
			next(errors(21301));
		}
		GroupMember.forge({
			userid: user.id,
			groupid: req.body['groupid']
		}).fetch()
			.then(function (m) {
				if (!m.get('isadmin') && !m.get('isowner')) {
					next(errors(21301));
				} else {
					User.forge({id: req.body['userid']}).fetch()
						.then(function (u) {
							quit(u, req.body['groupid'], next);
						});
				}
			}).catch(next);
	});

	/**
	 * POST /api/groups/update <br/>
	 * 圈主可操作
	 * @method 更新圈子信息
	 * @param {Number} groupid 圈子id
	 * @param {String} name
	 * @param {String} description
	 * @return {JSON}
	 { msg: 'group profile updated' }
	 */
	app.post('/api/groups/update', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors(21301));
		if (!req.body['groupid']) return next(errors(10008));
		Group.forge({
			id: req.body['groupid']
		}).fetch()
			.then(function (g) {
				if (g.get('ownerid') != user.id) {
					next(errors(20102));//not your own
				} else {
					g.set(req.body)
						.save()
						.then(function () {
							next({ msg: 'group profile updated' });
							//产生动态
							Event.add(user.id, g.get('id'), 'group', g.get('id'), ' 圈主更新了圈子信息');
						});
				}
			}).catch(next);
	});

	/**
	 * POST /api/groups/avatar/update <br/>
	 * 圈主和管理员课操作
	 * @method 更新圈子头像
	 * @param {Number} groupid
	 * @param {File} avatar
	 * @return {JSON}
	 */
	app.post('/api/groups/avatar/update', function (req, res, next) {
		var user = req.user,
			file = req.files['avatar'];
		if (!user) return next(errors(21301));
		if (!file) return next(errors(20007));
		GroupMember.forge({userid: user.id, groupid: req.body['groupid']})
			.fetch()
			.then(function (groupMember) {
				if (!groupMember.get('isowner') && !groupMember.get('isadmin')) {
					return next(errors(21301));
				}
				if (file['type'] != 'image/jpeg') return next(errors(20005));
				if (file['size'] > imageLimit) return next(errors(20006));
				Group.forge({id: req.body['groupid']})
					.fetch()
					.then(function (g) {
						g.updateAsset('avatar', file['path'])
							.then(function () {
								next({msg: 'Avatar updated'});
								//产生动态
								Event.add(user.id, g.get('id'), 'group', g.get('id'), ' 圈主更新了圈子头像');
							}).catch(next);
					});
			});
	});
};

/**
 * join 加入圈子
 * @param user 发起动作的人
 * @param userid 要加入圈子的用户id，数组
 * @param groupid
 * @param next
 * @returns {*}
 */
function join(user, userid, groupid, next) {
	var members = GroupMember.Set.forge();
	for (var i = 0; i < userid.length; i++) {
		members.add(GroupMember.forge({
			'userid': userid[i],
			'groupid': groupid
		}));
	}
	//不能重复加入，在数据库里控制
	return members.invokeThen('save')
		.then(function () {
			next({msg: 'join group success'});
			Event.add(user.id, groupid, 'group', groupid, '圈子里来了新成员');
		}).catch(function (err) {
			if (/^ER_DUP_ENTRY/.test(err.message)) {
				next(errors(20506));
			} else {
				next(err);
			}
		});
}

function quit(user, groupid, next) {
	return GroupMember.forge({
		'userid': user.id,
		'groupid': groupid
	}).fetch()
		.then(function (groupMember) {
			if (!groupMember) {
				return next(errors(40001));
			}
			return groupMember.destroy()
				.then(function () {
					next({
						msg: 'quit group success'
					});
					Event.add(user.id, groupid, 'group', groupid, user.get('username') + ' 退出了圈子');
				});
		});
}
