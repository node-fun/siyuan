var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	IssueComment = require('./issue-comment'),
	Issue, Issues;

Issue = module.exports = syBookshelf.Model.extend({
	tableName: 'issues',
	fields: [
		'id', 'userid', 'title', 'body', 'posttime'
	],

	defaults: function () {
		return {
			title: '',
			body: '',
			posttime: new Date()
		};
	},

	comments: function () {
		return this.hasMany(IssueComment, 'issueid');
	},

	countComments: function () {
		var self = this;
		return this.comments().query().count('*')
			.then(function (result) {
				return result[0]['count(*)'];
			}).then(function (numComments) {
				return self.set('numComments', numComments);
			});
	},

	fetch: function () {
		var ret = Issue.__super__
			.fetch.apply(this, arguments);
		return ret.then(function (issue) {
			return issue.countComments();
		});
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
	},

	view: function (query) {
		return Issue.forge({ id: query['id'] })
			.fetch()
			.then(function (issue) {
				if (!issue) return Promise.rejected(errors[20603]);
				return issue.load(['comments']);
			});
	}
});

Issues = Issue.Set = syBookshelf.Collection.extend({
	model: Issue,

	fetch: function () {
		var ret = Issues.__super__
			.fetch.apply(this, arguments);
		return ret.then(function (issues) {
			return issues.invokeThen('countComments');
		});
	}
});
