/**
 * Created by Cam on 14-2-18.
 * @class 消息
 */
var Message = require('../models/message'),
	Messages = Message.Set,
	syBookshelf = require('../models/base'),
	path = require('path'),
	config = require('../config'),
	_ = require('underscore'),
	errors = require('../lib/errors');

module.exports = function (app) {
	
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
		if (!req.user) return next(errors(21301));
		Messages.forge().query()
			.where({'receiverid': req.user.id, 'isread': 0})
			.count('id')
			.then(function (m) {
				next({count: m[0]["count(`id`)"]});
			}).catch(next);
		// make a heartbeat
		req.session['stamp'] = Date.now();
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
		if (!req.user) return next(errors(21301));
		var q = req.body;
		if (!q['receiverid'] || !q['title'] || !q['body']) return next(errors(10008));
		q['senderid'] = req.user.id;
		q['sourceid'] = null;//发消息，不需要此参数
		Message.forge(q)
			.send()
			.then(function (message) {
				next({
					msg: 'message sended',
					id: message.id
				});
			}).catch(next);
	});

	/**
	 * GET /api/messages/list <br>
	 * 需登录，支持limit（默认10）、page（默认1），返回的是当前登录用户的消息列表 <br>
	 * @method 消息列表
	 * @return {JSON}
	<pre>
	 {
        "messages":[
		  {
			"id": 4,
			"senderid": 2,
			"receiverid": 1,
			"title": "2--->1",
			"body": null,
			"isread": 0,
			"isreplied": 0,
			"sourceid": null,
			"sendtime": "2014-03-10T07:22:10.000Z",
			"unreadcount": 2,     //此好友发来的未读消息数
			"sendername": "Francisco Brewer",   //发送者的名字
			"senderavatar": "\\avatars\\2.jpg?t=1393055835537"      //发送者头像
		  },
		  {
			"id": 3,
			"senderid": 3,
			"receiverid": 1,
			"title": "1122",
			"body": null,
			"isread": 0,
			"isreplied": 0,
			"sourceid": null,
			"sendtime": "2014-03-09T03:23:44.000Z",
			"unreadcount": 1,
			"sendername": "Griffin Estrada",
			"senderavatar": "\\avatars\\3.jpg?t=1393055835500"
		  }
		]
	}
	 </pre>
	 */
	app.get('/api/messages/list', function (req, res, next) {
		if (!req.user) return next(errors(21301));
		Messages.unreadList(req)
			.then(function (resp) {
				messages = resp[0];
				messages.forEach(function(m){
					//转换头像url
					var value = m['senderavatar'];
					m['senderavatar'] = path.join(config.assets['avatars'].dir, m['senderid'] + config.assets['avatars'].ext);
					m['senderavatar'] = config.toStaticURI( m['senderavatar'] );
					if (value != null) {
						m['senderavatar'] += '?t=' + value;
					}
					//转timestamp
					m['sendtime'] = m['sendtime'].getTime();
				});
				next({messages: messages});//返回查询结果
			}).catch(next);
	});

	/**
	 * GET /api/messages/record <br>
	 * 需登录，支持limit,page,offset,orders <br>
	 * 注意这里的时间是降序排列的，由新到旧 <br>
	 * 成功发送后此对话标记为已读 <br>
	 * @method 与某人的消息记录
	 * @param {Number} friendid 好友的id
	 * @return {JSON}
	 * <pre>
		{
			"messages": [
			{
				"id": 4,
				"senderid": 2,
				"receiverid": 1,
				"title": "2--->1",  //1发给2的消息
				"body": null,
				"isread": 0,
				"isreplied": 0,
				"sendtime": 1394436130000
			},
			{
				"id": 1,
				"senderid": 1,
				"receiverid": 2,
				"title": "1->2",  //2发给1的消息
				"body": null,
				"isread": 0,
				"isreplied": 0,
				"sendtime": 1394249018000
			},
			{
				"id": 2,
				"senderid": 2,
				"receiverid": 1,
				"title": "2->1",  //1发给2的消息
				"body": null,
				"isread": 0,
				"isreplied": 0,
				"sendtime": 1393056294000
			}
		]
		}
	 </pre>
	 */
	app.get('/api/messages/record', function (req, res, next) {
		if (!req.user) return next(errors(21301));
		if (!req.query['friendid']) return next(errors(10008));
		var userid = req.user.id,
			friendid = req.query['friendid'];
		Messages.forge().query(function (qb) {
			qb.where('senderid', userid)
				.andWhere('receiverid', friendid)
				.orWhere('senderid', friendid)
				.andWhere('receiverid', userid)
				.orderBy('sendtime', 'desc');
		}).fetch({req: req})
			.then(function (m) {
				next({messages: m});
				//标记已读
				Messages.markRead(friendid, userid).then(next);
			}).catch(next);
	});
}