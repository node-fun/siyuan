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

	find: function (match, offset, limit) {
		var accepts = ['id', 'userid'];
		return Issues.forge()
			.query(function (qb) {
				_.each(accepts, function (k) {
					if (k in match) {
						qb.where(k, match[k]);
					}
				});
			}).query('offset', offset)
			.query('limit', limit)
			.fetch();
	},

	search: function (match, offset, limit) {
		var accepts = ['title', 'body'],
			count = 0;
		return Issues.forge()
			.query(function (qb) {
				_.each(accepts, function (k) {
					if (k in match) {
						count++;
						qb.where(k, 'like', '%' + match[k] + '%');
					}
				});
			}).query('offset', offset)
			.query('limit', count ? limit : 0)
			.fetch();
	}
});

Issues = Issue.Set = syBookshelf.Collection.extend({
	model: Issue
});
