/**
 * Created by Cam on 14-2-18.
 * @class 消息
 */
var Message = require('../models/message'),
	Messages = Message.Set,
	_ = require('underscore'),
	errors = require('../lib/errors');

module.exports = function (app) {
	/**
	 * GET /api/messages/list <br/>
	 * 需登录
	 * @method 消息列表
	 * @param {String} [type] type=send:表示取发信列表，其他或不传值则返回收信列表
	 * @param {String} page/limit/order
	 */
	app.get('/api/messages/list', function (req, res, next) {
		var user = req.user;
		if(!user) return next(errors(21301));
		if(req.query['type']=='send'){
			req.query['sender'] = user.id;
		}else{
			req.query['receiver'] = user.id;
		}
		Messages.forge().fetch({req: req})
			.then(function (messages) {
				next({ messages: messages});
			}).catch(next);
	});
	
	/**
	 * GET /api/messages/unreadcount <br/>
	 * 需登录
	 * @method 未读消息数量
	 * @return {JSON} 
		{
		  "count": 1
		}
	 */
	app.get('/api/messages/unreadcount', function (req, res, next) {
		var user = req.user;
		if(!user) return next(errors[21301]);
		Messages.forge().query()
			.where({'receiver': user.id, 'isread': 0})
			.count('id')
			.then(function(m){
				next({count: m[0]["count(`id`)"]});
			}).catch(next);
	});

	/**
	 * POST /api/messages/send
	 * @method 发消息
	 * @param {Number} receiver 收件人
	 * @param {String} title 标题
	 * @param {String} body 内容
	 * @return {JSON} 
	 * {
			msg: 'message sended',
			id: 1
		}
	 */
	app.post('/api/messages/send', function (req, res, next) {
		if(!req.user) return next(errors(21301));
		var q = req.query;
		if(!q['receiver'] || !q['title'] || !q['body']) return next(errors(10008));
		q['sender'] = req.user.id;
		q['sourceid'] = null;//发消息，不需要此参数
		Message.forge(q)
			.send()
			.then(function(message) {
				next({
					msg: 'message sended',
					id: message.id
				});
			}).catch(next);
	});

	/**
	 * POST /api/messages/reply
	 * @method 回复消息
	 * @param {Number} sourceid 要回复的消息id
	 * @param {String} title 标题
	 * @param {String} body 内容
	 * @return {JSON}
	 * {
			msg: 'message replied',
			id: 1
		}
	 */
	app.post('/api/messages/reply', function (req, res, next) {
		if(!req.user) return next(errors(21301));
		req.query['sender'] = req.user.id;
		Message.forge({id: req.query['sourceid']})
			.fetch()
			.then(function(sourceMessage){
				if(!sourceMessage) return next(errors(20603));
				req.query['receiver'] = sourceMessage.get('sender');
				return Message.forge(req.query)
					.send()
					.then(function(message) {
						next({
							msg: 'message replied',
							id: message.id
						});
						sourceMessage.set({isreplied: 1}).save();
					});
			}).catch(next);
		
	});

	/**
	 * POST /api/messages/markread
	 * @method 标记为已读
	 * @param {Number} id 消息id
	 * @return {JSON}
	 * {
			msg: 'message markread success',
			id: 1
		}
	 */
	app.post('/api/messages/markread', function (req, res, next) {
		if(!req.user) return next(errors(21301));
		if(!req.query['id']) return next(errors(10008));
		Message.forge(_.pick(req.query, 'id'))
			.fetch()
			.then(function(message) {
				if(message.get('receiver') != req.user.id)
					return next(errors(20102));
				return message.set({isread: 1})
					.save()
					.then(function(m){
						next({
							msg: 'message markread success',
							id: m.id
						});
				});
			}).catch(next);
	});
}