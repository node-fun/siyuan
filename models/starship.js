/**
 * Created by fritz on 1/20/14.
 */
var syBookshelf = require('./base'),
	Entity = require('../lib/entity'),
	Starship, Starships;

Starship = module.exports = syBookshelf.Model.extend({
	tableName: 'starship',
	fields: [
		'id', 'userid', 'itemtype', 'itemid', 'remark'
	],

	fetched: function (model) {
		return Starship.__super__.fetched.apply(this, arguments)
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
	typesAllowed: ['issue', 'activity', 'cooperation']
});

Starships = Starship.Set = syBookshelf.Collection.extend({
	model: Starship,

	lister: function (req, qb) {
		this.qbWhere(qb, req, req.query, ['id', 'userid', 'itemtype', 'itemid']);
	}
});
