/**
 * Created by Cam on 14-2-18.
 */
var syBookshelf = require('./base'),
	User = require('./user'),
	config = require('../config'),
	Message, Messages,
	tableName = 'message';

Message = module.exports = syBookshelf.Model.extend({
	tableName: tableName,
	fields: [
		'id', 'senderid', 'receiverid', 'title', 'body', 'isread', 'isreplied', 'sourceid', 'sendtime'
	],
	omitInJSON: ['sourceid'],
	
	defaults: function () {
		return {
			sendtime: new Date()
		};
	},
	
	sender: function () {
		return this.belongsTo(require('./user'), 'senderid');
	},
	receiver: function () {
		return this.belongsTo(require('./user'), 'receiverid');
	},
	send: function () {
		this.attributes = this.pick(['senderid', 'receiverid', 'title', 'body', 'sourceid']);
		return this.save();
	}
}, {
	//Send system message.
	send: function (receiverid, body) {
		return Message.forge({senderid: config.systemid, receiverid: receiverid, body: body}).save();
	}
});

Messages = Message.Set = syBookshelf.Collection.extend({
	model: Message,
	
	lister: function (req, qb) {
		this.qbWhere(qb, req, req.query, ['senderid', 'receiverid']);
	}
	
}, {

	unreadList: function (req) {
		var receiverid = req.user.id,
			lim = req.query['limit'] ? req.query['limit'] : 10,
			page = req.query['page'] ? req.query['page'] : 1;
		var offs = lim * (page-1);
		var sql = 'select mm.*, up.name sendername, u.avatar senderavatar from (select *, -sum(isread-1) unreadcount from (select * from ' + tableName + ' where receiverid = '+ receiverid +' ORDER BY sendtime desc) m GROUP BY senderid) mm, user_profiles up, users u where mm.senderid = up.userid and u.id = up.userid ORDER BY sendtime DESC'
			+ ' limit ' + lim + ' offset ' + offs;
		return syBookshelf.knex
			.raw(sql);
	},
	
	markRead: function(senderid, receiverid){
		return syBookshelf.knex
			.raw('update ' + tableName + ' set isread=1 where isread!=1 and senderid=' + senderid + ' and receiverid=' + receiverid);
	}
});