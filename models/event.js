/**
 * Created by fritz on 1/21/14.
 */
var _ = require('underscore'),
	syBookshelf = require('./base'),
	requireFn = require('../lib/requireFn'),
	User = requireFn('./user'),
	Event, Events;

Event = module.exports = syBookshelf.Model.extend({
	tableName: 'events',
	fields: [
		'id', 'userid', 'groupid', 'itemtype', 'itemid', 'message'
	],
	withRelated: ['user.profile'],

	user: function () {
		return this.belongsTo(User(), 'userid');
	}
}, {

});

Events = Event.Set = syBookshelf.Collection.extend({
	model: Event,

	fetch: function () {
		return Events.__super__.fetch.apply(this, arguments)
			.then(function (collection) {
				return collection.invokeThen('fetch')
					.then(function(){
						return collection;
					});
			});
	}
}, {
	finder: function (qb, query) {
		['id', 'userid', 'groupid', 'itemtype', 'itemid'].forEach(function (k) {
			if (k in query) {
				qb.where(k, query[k]);
			}
		});
	},

	searcher: function (qb, query) {
		var count = 0;
		['userid', 'groupid', 'itemtype', 'itemid'].forEach(function (k) {
			if (k in query) {
				count++;
				qb.where(k, query[k]);
			}
		});
		['message'].forEach(function (k) {
			if (k in query) {
				count++;
				qb.where(k, 'like', '%' + query[k] + '%');
			}
		});
		if (count < 1) query['limit'] = 0;
	}
});
