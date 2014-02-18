/**
 * Created by Cam on 14-2-18.
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
		if(!user) return next(errors[21301]);
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
}