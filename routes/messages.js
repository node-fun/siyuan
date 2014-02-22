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
	 * GET /api/messages/receivelist <br/>
	 * 需登录
	 * @method 收消息列表
	 * @param {String} page/limit/order
	 * @return {JSON}
	{
		"messages": [
		{
			"id": 2,
			"title": "2发给1的一条消息",
			"body": "这是内容",
			"isread": 0,
			"isreplied": 0,
			"sendtime": 1393056294000,
			"sender": {
				"id": 2,
				"username": "saceza_837",
				"regtime": 1362543202000,
				"isonline": 1,
				"avatar": "\\avatars\\2.jpg?t=1393055835537",
				"cover": "\\covers\\2.jpg?t=1393055835700",
				"profile": {
					"email": "ga@pahipkiw.io",
					"name": "Francisco Brewer",
					"gender": "f",
					"age": 48,
					"grade": 1984,
					"university": "Depubiafi University",
					"major": "Cupirisa",
					"summary": "Nophowip dat hivig celala abma meumraj hawbetir set pikag watob benozveh hu ok za.",
					"tag": "dipedkoj,cep,awuvir"
				},
				"isfollowed": 0
			}
		}
	]
	}
	 */
	app.get('/api/messages/receivelist', function (req, res, next) {
		var user = req.user;
		if(!user) return next(errors(21301));
		req.query['receiverid'] = user.id;
		Messages.forge().fetch({ req: req, related: ['sender'] })
			.then(function (messages) {
				next({ messages: messages});
			}).catch(next);
	});

	/**
	 * GET /api/messages/sendlist <br/>
	 * 需登录
	 * @method 发消息列表
	 * @param {String} page/limit/order
	 */
	app.get('/api/messages/sendlist', function (req, res, next) {
		var user = req.user;
		if(!user) return next(errors(21301));
		req.query['senderid'] = user.id;
		Messages.forge().fetch({req: req, related: ['receiver'] })
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
			.where({'receiverid': user.id, 'isread': 0})
			.count('id')
			.then(function(m){
				next({count: m[0]["count(`id`)"]});
			}).catch(next);
	});

	/**
	 * POST /api/messages/send
	 * @method 发消息
	 * @param {Number} receiverid 收件人
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
		if(!q['receiverid'] || !q['title'] || !q['body']) return next(errors(10008));
		q['senderid'] = req.user.id;
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
		req.query['senderid'] = req.user.id;
		Message.forge({id: req.query['sourceid']})
			.fetch()
			.then(function(sourceMessage){
				if(!sourceMessage) return next(errors(20603));
				req.query['receiverid'] = sourceMessage.get('senderid');
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
				if(message.get('receiverid') != req.user.id)
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