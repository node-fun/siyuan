var syBookshelf = require('./base'),
	Followship, Followships;

Followship = module.exports = syBookshelf.Model.extend({
	tableName: 'followship',
	fields: [
		'id', 'userid', 'followid', 'remark'
	],
	omitInJSON: ['id', 'userid', 'followid'],
	appended: ['user', 'followee'],

	user: function () {
		return this.belongsTo(require('./user'), 'userid');
	},
	followee: function () {
		return this.belongsTo(require('./user'), 'followid');
	}
});

Followships = Followship.Set = syBookshelf.Collection.extend({
	model: Followship,

	lister: function (req, qb) {
		this.qbWhere(qb, req, req.query, ['id', 'userid', 'followid']);
	}
});
