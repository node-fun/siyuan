/**
 * Created by cin on 1/24/14.
 */
var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	CoComment, CoComments;

CoComment = module.exports = syBookshelf.Model.extend({
	tableName: 'co_comments',
	fields: ['id', 'cooperationid', 'userid', 'body', 'posttime'],
	omitInJSON: ['id', 'userid', 'issueid'],
	appended: ['user'],

	defaults: function () {
		return {
			body: '',
			posttime: new Date()
		}
	},
	user: function () {
		return this.belongsTo(require('./user'), 'userid');
	}
}, {
	randomForge: function () {
		return CoComment.forge({
			body: chance.sentence(),
			posttime: chance.date({ year: 2013 })
		});
	},

	find: function (query) {
		var forCoComment = ['id', 'cooperationid', 'userid'],
			cocomments = CoComments.forge();
		return cocomments
			.query(function (qb) {
				_.each(forCoComment, function (k) {
					if (k in query) {
						qb.where(k, query[k]);
					}
				})
			}).query(function (qb) {
				query['orders'].forEach(function (order) {
					qb.orderBy(order[0], order[1]);
				});
			}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch();
	}
});

CoComments = CoComment.Set = syBookshelf.Collection.extend({
	model: CoComment
});
