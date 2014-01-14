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
					return group.load(['members', 'members.profile', 'members.profile.profile']);
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
	 * @return {Array}
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
	 * @return {Array} {  
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
	 * @return {Array} {  
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
};
