/**
 * Created by Cam on 14-2-18.
 */
var syBookshelf = require('./base'),
	Message, Messages;

Message = module.exports = syBookshelf.Model.extend({
	tableName: 'message',
	fields: [
		'id', 'sender', 'receiver', 'title', 'body', 'isread', 'isreplied', 'sourceid', 'sendtime'
	],

	defaults: function () {
		return {
			sendtime: new Date()
		};
	},
	send: function () {
		this.attributes = this.pick(['sender', 'receiver', 'title', 'body', 'sourceid']);
		return this.save();
	}
}, {
	markRead: function(id){
		return Message.forge({id: id})
			.fetch()
			.then(function(m){
				return m.set({isread: 1}).save();
			});
	},
	markReplied: function(id){
		return Message.forge({id: id})
			.fetch()
			.then(function(m){
				return m.set({isreplied: 1}).save();
			});
	}
});

Messages = Message.Set = syBookshelf.Collection.extend({
	model: Message,
	
	lister: function (req, qb) {
		this.qbWhere(qb, req, req.query, ['sender', 'receiver']);
	}
});