/**
 * Created by fritz on 1/20/14.
 */
var syBookshelf = require('./base'),
	Starship, StarshipSet;

Starship = module.exports = syBookshelf.Model.extend({
	tableName: 'starship',
	fields: [
		'id', 'userid', 'itemtype', 'itemid', 'remark'
	],
	omitInJSON: ['userid'],

	user: function () {
		return this.belongsTo(require('./user'), 'userid');
	}
}, {
	find: function (query) {
		return StarshipSet.forge()
			.query(function (qb) {
				['id', 'userid', 'itemtype', 'itemid'].forEach(function (k) {
					if (k in query) {
						qb.where(k, query[k]);
					}
				});
			}).query(function(qb){
				query['orders'].forEach(function (order) {
					qb.orderBy(order[0], order[1]);
				});
			}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch();
	}
});

StarshipSet = Starship.Set = syBookshelf.Collection.extend({
	model: Starship,

	fetch: function () {
		return StarshipSet.__super__.fetch.apply(this, arguments)
			.then(function (collection) {
				return collection.invokeThen('fetch');
			});
	}
});
