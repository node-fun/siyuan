/**
 * Created by Cam on 14-2-18.
 */
var syBookshelf = require('./base'),
	User = require('./user'),
	Message, Messages;

Message = module.exports = syBookshelf.Model.extend({
	tableName: 'message',
	fields: [
		'id', 'senderid', 'receiverid', 'title', 'body', 'isread', 'isreplied', 'sourceid', 'sendtime'
	],
	omitInJSON: ['senderid', 'receiverid', 'sourceid'],
	
	defaults: function () {
		return {
			sendtime: new Date()
		};
	},
	
	fetched: function(model, resp, options){
		var p = Message.__super__.fetched.apply(this, arguments);
		if (options['related']) {
			options['related'].forEach(function(k){
				return p = p.then(function(){
					return model.related(k).fetch();
				});
			});
		}
		return p;
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
		this.qbWhere(qb, req, req.query, ['senderid', 'receiverid']);
	}
});