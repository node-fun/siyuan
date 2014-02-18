/**
 * Created by fritz on 1/21/14.
 */
var _ = require('underscore'),
	syBookshelf = require('./base'),
	Entity = require('../lib/entity'),
	entities = require('../config').entities,
	Event, Events;

Event = module.exports = syBookshelf.Model.extend({
	tableName: 'events',
	fields: [
		'id', 'userid', 'groupid', 'itemtype', 'itemid', 'message'
	],
	omitInJSON: ['userid'],
	appended: ['user'],

	fetched: function (model) {
		return Event.__super__.fetched.apply(this, arguments)
			.then(function () {
				var itemtype = model.get('itemtype'),
					itemid = model.get('itemid');
				return Entity.forge(itemtype, { id: itemid })
					.then(function (entity) {
						return !entity ? null : entity.fetch();
					}).then(function (entity) {
						return model.set({
							typename: Entity.getModelName(itemtype),
							item: entity
						});
					});
			});
	},
	
	user: function () {
		return this.belongsTo(require('./user'), 'userid');
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
	model: Event,

	lister: function (req, qb) {
		this.allowNull(req.query, ['groupid'])
			.qbWhere(qb, req, req.query, ['id', 'userid', 'groupid', 'itemtype', 'itemid']);
		if (req.query['fuzzy']) {
			this.qbWhereLike(qb, req, req.query, ['message']);
		}
	}
});
