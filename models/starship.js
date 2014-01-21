/**
 * Created by fritz on 1/20/14.
 */
var _ = require('underscore'),
	syBookshelf = require('./base'),
	Starship, StarshipSet;

Starship = module.exports = syBookshelf.Model.extend({
	tableName: 'starship',
	fields: [
		'id', 'userid', 'typeid', 'itemid', 'remark'
	],
	omitInJSON: ['userid'],

	user: function () {
		return this.belongsTo(require('./user'), 'userid');
	}
}, {
	find: function (query) {
		var accepts = ['id', 'userid', 'typeid'];
		return StarshipSet.forge()
			.query(function (qb) {
				_.each(accepts, function (k) {
					if (k in query) {
						qb.where(k, query[k]);
					}
				});
			}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch();
	}
});

StarshipSet = Starship.Set = syBookshelf.Collection.extend({
	model: Starship
});
