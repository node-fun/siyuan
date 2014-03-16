/**
 * Created by cin on 1/24/14.
 */
var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	Starship = require('./starship'),
	tbCoComment = 'co_comments',
	CoComment, CoComments;

CoComment = module.exports = syBookshelf.Model.extend({
	tableName: tbCoComment,
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
	},

	saved: function (model) {
		return CoComment.__super__.saved.apply(this, arguments)
			.then(function () {
				// auto star
				return Starship.forge({
					itemtype: 2,
					itemid: model.get('cooperationid'),
					userid: model.get('userid')
				}).save()
					.catch(function (err) {
						if (!/^ER_DUP_ENTRY/.test(err.message)) {
							throw err;
						}
					});
			});
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
	model: CoComment,

	lister: function (req, qb) {
		var query = req.query;
		this.qbWhere(qb, req, query, ['id', 'cooperationid', 'userid', 'posttime'], tbCoComment)
	}
});
