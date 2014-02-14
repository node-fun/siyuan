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
	withRelated: ['user.profile'],

	user: function () {
		return this.belongsTo(require('./user'), 'userid');
	}
}, {

});

Events = Event.Set = syBookshelf.Collection.extend({
	model: Event,

	fetch: function () {
		return Events.__super__.fetch.apply(this, arguments)
			.then(function (collection) {
				return collection.invokeThen('fetch');
			});
	}
}, {
	finder: function (qb, query) {
		['id', 'userid', 'groupid', 'itemtype', 'itemid'].forEach(function (k) {
			if (k in query) {
				qb.where(k, query[k]);
			}
		});
	}
});
