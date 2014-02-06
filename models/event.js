/**
 * Created by fritz on 1/21/14.
 */
var _ = require('underscore'),
	syBookshelf = require('./base'),
	Event, Events;

Event = module.exports = syBookshelf.Model.extend({
	tableName: 'events',
	fields: [
		'id', 'userid', 'groupid', 'itemtype', 'itemid', 'message'
	],

	user: function () {
		return this.belongsTo(require('./user'), 'userid');
	}
}, {
	find: function (query) {
		var accepts = ['id', 'userid', 'groupid', 'itemtype', 'itemid'];
		return Events.forge()
			.query(function (qb) {
				_.each(accepts, function (k) {
					if (k in query) {
						qb.where(k, query[k]);
					}
				});
			}).query(function (qb) {
				query['orders'].forEach(function (order) {
					qb.orderBy(order[0], order[1]);
				});
			}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch({
				withRelated: ['user.profile']
			});
	}
});

Events = Event.Set = syBookshelf.Collection.extend({
	model: Event
});
