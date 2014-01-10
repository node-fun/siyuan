var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	Issue, Issues;

Issue = module.exports = syBookshelf.Model.extend({
	tableName: 'issues',
	fields: [
		'id', 'userid', 'title', 'body', 'posttime'
	],

	defaults: function () {
		return {
			posttime: new Date()
		};
	}
}, {
	randomForge: function () {
		return Issue.forge({
			title: chance.sentence(),
			body: chance.paragraph(),
			posttime: chance.date({ year: 2013 })
		});
	},

	find: function (query) {
		var accepts = ['id', 'userid', 'title'];
		return Issues.forge()
			.query(function (qb) {
				_.each(accepts, function (k) {
					if (k in query) {
						qb.where(k, query[k]);
					}
				});
			}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch();
	},

	search: function (query) {
		var accepts = ['title', 'body'], count = 0;
		return Issues.forge()
			.query(function (qb) {
				_.each(accepts, function (k) {
					if (k in query) {
						count++;
						qb.where(k, 'like', '%' + query[k] + '%');
					}
				});
			}).query('offset', query['offset'])
			.query('limit', count ? query['limit'] : 0)
			.fetch();
	}
});

Issues = Issue.Set = syBookshelf.Collection.extend({
	model: Issue
});
