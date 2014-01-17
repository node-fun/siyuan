/**
 * Created by Cam on 14-1-8.
 * @class 圈子
 */
var _ = require('underscore'),
	Group = require('../models/group'),
	GroupMember = require('../models/group-membership'),
	errors = require('../lib/errors'),
	Groups = Group.Set;

module.exports = function (app) {
	/**
	 * post /api/groups/find
	 * @method 圈子列表
	 * @param {Number} [id] 
	 * @param {String} [ownerid] 创建者id
	 * @param {String} [name] 圈子名
	 * @return {JSON}
	 * <pre>
	{
		"groups": [
		{
			"id": 1,
			"ownerid": 26,
			"name": "cab",
			"description": "Cavgob ija of bilzoro ded gibruzup mar mi pabigkum gegwubez je mig kegiso ufaica votojnuj zavo iki iw. Fefufi bawum gamokzap ni si nizifca con magi evubinek wawke cutero tan hanasboz wozes upvip su owicore. Ne lupwegsav medap ipajies pek ge jucrokub otihuham bi rafma peobizon teh",
			"createtime": 1380494258000,
			"avatar": null,
			"members": [
				{
					"userid": 24,
					"isowner": 0,
					"isadmin": 0,
					"remark": "jumefojek",
					"profile": {
						"id": 24,
						"username": "mifi_94",
						"regtime": 1385861668000,
						"isonline": 0,
						"profile": {
							"email": "hipignoz@inojuptuw.com",
							"nickname": "Angelina Swanson",
							"name": "Savannah Patterson",
							"gender": "f",
							"age": 53,
							"grade": 1978,
							"university": "Tonadde University",
							"major": "Onpuval"
						},
						"avatar": "/avatars/24.jpg"
					}
				},
				...
			]
		}
	]
	}
	</pre>
	 */
	app.get('/api/groups/find', function (req, res, next) {
		var query = req.query,
			accepts = ['id', 'ownerid', 'name'];
		Groups.forge().query(function (qb) {
			_.each(accepts, function (k) {
				if (k in query) {
					qb.where(k, query[k]);
				}
			});
		}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch()
			.then(function (groups) {
				groups.mapThen(function (group) {
					return group.load(['members', 'members.profile']);
				}).then(function(groups) {
						next({
							groups: groups
						});
					});
			}).catch(next);
	});

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
	app.post('/api/groups/create', function(req, res, next){
		var user = req.user;
		if (!user) return next(errors[21301]);
		if (!req.body['name'] || !req.body['description']) {
			return next(errors[10008]);
		}
		Group.forge({name: req.body['name']})
			.fetch()
			.then(function (group) {
				if (group) {
					return next(errors[20506]);
				}
				return Group.forge(_.extend({
					ownerid: user.id
				}, req.body)).save();
			}).then(function (group) {
				next({
					msg: 'group created',
					id: group.id
				});
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
	app.post('/api/groups/join', function(req, res, next){
		var user = req.user;
		if(!user) return next(errors[21301]);
		return GroupMember.forge({
			'userid': user.id,
			'groupid': req.body['groupid']
		}).fetch()
			.then(function(groupMember){
				if(groupMember){
					return next(errors[20506]);
				}
				return GroupMember.forge({
					'userid': user.id,
					'groupid': req.body['groupid']
				}).save()
					.then(function(groupMember){
						next({
							msg: 'join group success'
						});
					});
			});
	});

	/**
	 * post /api/groups/quit
	 * @method 退出圈子
	 * @param {Number} groupid 圈子id
	 * @return {JSON} {  
	 * 　　msg: 'quit group success'  
	 * }
	 */
	app.post('/api/groups/quit', function(req, res, next){
		var user = req.user;
		if(!user) return next(errors[21301]);
		return GroupMember.forge({
			'userid': user.id,
			'groupid': req.body['groupid']
		}).fetch()
			.then(function(groupMember){
				if(!groupMember){
					return next(errors[40001]);
				}
				return groupMember.destroy()
					.then(function(){
						next({
							msg: 'quit group success'
						});
					});
			});
	});

	/**
	 * GET /api/groups/my  
	 * 含我加入的、我创建的圈子列表。
	 * @method 我的圈子列表
	 * @return {JSON}
	{
		"groups": [
			{
				"id": 1,
				"ownerid": null,
				"name": null,
				"description": null,
				"createtime": null,
				"avatar": null,
				"_pivot_userid": 101,
				"_pivot_groupid": 1
			},
			{
				"id": 2,
				"ownerid": null,
				"name": null,
				"description": null,
				"createtime": null,
				"avatar": null,
				"_pivot_userid": 101,
				"_pivot_groupid": 2
			}
		]
	}
	 */
	app.get('/api/groups/my', function(req, res, next){
		if(!req.user) return next(errors[21301]);
		req.user.related('groups').fetch().then(function(groups){
			next({groups: groups});
		});
	});

	/**
	 * POST /api/groups/setadmin
	 * @method 设置管理员
	 * @param {Number} userid 成员的id
	 * @param {Number} groupid 圈子id
	 * @return {JSON}
		{
			msg: "set admin success"
		}
	 */
	app.post('/api/groups/setadmin', function(req, res, next){
		var user = req.user;
		if(!user){
			next(errors[21301]);
		}
		GroupMember.forge({
			userid: user.id,
			groupid: req.body['groupid']
		}).fetch()
			.then(function(m){
				if(!m.get('isadmin')){
					next(errors[21301]);
				}else{
					GroupMember.forge({
						userid: req.body['userid'],
						groupid: req.body['groupid']
					})
						.fetch()
						.then(function(m){
							m.set('isadmin',1);
							m.save()
								.then(function(){
									next({
										msg: "set admin success"
									});
								});
						});
				}
			});
	});

	/**
	 * POST /api/groups/canceladmin
	 * @method 撤销管理员
	 * @param {Number} userid 成员的id
	 * @param {Number} groupid 圈子id
	 * @return {JSON}
	 {
		msg: "cancel admin success"
	}
	 */
	app.post('/api/groups/canceladmin', function(req, res, next){
		var user = req.user;
		if(!user){
			next(errors[21301]);
		}
		GroupMember.forge({
			userid: user.id,
			groupid: req.body['groupid']
		}).fetch()
			.then(function(m){
				if(!m.get('isadmin')){
					next(errors[21301]);
				}else{
					GroupMember.forge({
						userid: req.body['userid'],
						groupid: req.body['groupid']
					})
						.fetch()
						.then(function(m){
							m.set('isadmin',0);
							m.save()
								.then(function(){
									next({
										msg: "cancel admin success"
									});
								});
						});
				}
			});
	});
	
	
	app.post('/api/groups/invite', function(req, res, next){
		var user = req.user;
		if(!user){
			next(errors[21301]);
		}
		GroupMember.forge({
			userid: user.id,
			groupid: req.body['groupid']
		}).fetch()
			.then(function(m){
				if(!m.get('isadmin') && !m.get('isowner')){
					next(errors[21301]);
				}else{
					
				}
			});
	});
};
