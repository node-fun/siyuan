/**
 * Created by fritz on 1/21/14.
 */
var _ = require('underscore'),
	syBookshelf = require('./base'),
	Event, Events;

Event = module.exports = syBookshelf.Model.extend({
	tableName: 'starship',
	fields: [
		'id', 'userid', 'groupid', 'itemtype', 'itemid', 'message'
	],

	user: function () {
		return this.belongsTo(require('./user'), 'userid');
	}
}, {
	find: function (query) {
		var accepts = ['id', 'userid', 'itemtype', 'itemid'];
		return Events.forge()
			.query(function (qb) {
				_.each(accepts, function (k) {
					if (k in query) {
						qb.where(k, query[k]);
					}
				});
			}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch({
				withRelated: ['user']
			});
	}
});

Events = Event.Set = syBookshelf.Collection.extend({
	model: Event
});
