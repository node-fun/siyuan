/**
 * Created by fritz on 1/21/14.
 */
var _ = require('underscore'),
	syBookshelf = require('./base'),
	requireFn = require('../lib/requireFn'),
	User = requireFn('./user'),
	Entity = require('../lib/entity'),
	entities = require('../config').entities,
	Event, Events;

Event = module.exports = syBookshelf.Model.extend({
	tableName: 'events',
	fields: [
		'id', 'userid', 'groupid', 'itemtype', 'itemid', 'message'
	],
	appended: ['user'],

	fetch: function () {
		return Event.__super__.fetch.apply(this, arguments)
			.then(function (event) {
				if (!event) return event;
				var itemtype = event.get('itemtype'),
					itemid = event.get('itemid');
				return Entity
					.forge(itemtype, { id: itemid })
					.then(function (model) {
						if (!model) return model;
						return model.fetch();
					}).then(function (entity) {
						return event.set({
							typename: Entity.getModelName(itemtype),
							item: entity
						});
					});
			});
	},
	
	user: function () {
		return this.belongsTo(User(), 'userid');
	}
}, {
	//产生新动态可以用这个函数
	add: function(userid, groupid, itemname, itemid, message){
		Event.forge({
			'userid': userid,
			'groupid': groupid,
			'itemtype': entities.indexOf(itemname) + 1,
			'itemid': itemid,
			'message': message
		}).save();
	}
});

Events = Event.Set = syBookshelf.Collection.extend({
	model: Event
}, {
	lister: function (qb, query) {
		this.allowNull(query, ['groupid'])
			.qbWhere(qb, query, ['id', 'userid', 'groupid', 'itemtype', 'itemid']);
		if (query['fuzzy']) {
			this.qbWhereLike(qb, query, ['message']);
		}
	}
});
