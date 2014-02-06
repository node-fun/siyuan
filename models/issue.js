var Promise = require('bluebird'),
	chance = new (require('chance'))(),
	errors = require('../lib/errors'),
	syBookshelf = require('./base'),
	IssueComment = require('./issue-comment'),
	IssueComments = IssueComment.Set,
	Issue, Issues;

Issue = module.exports = syBookshelf.Model.extend({
	tableName: 'issues',
	fields: [
		'id', 'userid', 'title', 'body', 'posttime'
	],
	omitInJSON: ['userid'],
	withRelated: ['user.profile'],

	defaults: function () {
		return {
			title: '',
			body: '',
			posttime: new Date()
		};
	},

	fetch: function () {
		return Issue.__super__.fetch.apply(this, arguments)
			.then(function (issue) {
				if (!issue) return issue;
				return issue.countComments();
			});
	},

	user: function () {
		return this.belongsTo(require('./user'), 'userid');
	},
	comments: function () {
		return this.hasMany(IssueComment, 'issueid');
	},

	countComments: function () {
		var self = this;
		return IssueComments.forge().query()
			.where('issueid', '=', self.id)
			.count('id')
			.then(function (d) {
				return self.data('numComments', d[0]["count(`id`)"]);
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
		return Issues.forge()
			.query(function (qb) {
				['id', 'userid', 'title'].forEach(function (k) {
					if (k in query) {
						qb.where(k, query[k]);
					}
				});
			}).query(function (qb) {
				query['orders'].forEach(function (order) {
					qb.orderBy(order[0], order[1]);
				});
			}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch();
	},

	search: function (query) {
		var count = 0;
		return Issues.forge()
			.query(function (qb) {
				['title', 'body'].forEach(function (k) {
					if (k in query) {
						count++;
						qb.where(k, query[k]);
					}
				});
				['userid'].forEach(function (k) {
					if (k in query) {
						count++;
						qb.where(k, 'like', '%' + query[k] + '%');
					}
				});
			}).query(function (qb) {
				query['orders'].forEach(function (order) {
					qb.orderBy(order[0], order[1]);
				});
			}).query('offset', query['offset'])
			.query('limit', count ? query['limit'] : 0)
			.fetch();
	},

	view: function (query) {
		return Issue.forge({ id: query['id'] })
			.fetch({
				withRelated: ['user.profile']
			}).then(function (issue) {
				if (!issue) return Promise.rejected(errors[20603]);
				return IssueComments.forge({ issueid: issue.id })
					.query('orderBy', 'id', 'desc')
					.fetch().then(function (comments) {
						return issue.set('comments', comments);
					});
			});
	}
});

Issues = Issue.Set = syBookshelf.Collection.extend({
	model: Issue,

	fetch: function () {
		return Issues.__super__.fetch.apply(this, arguments)
			.then(function (collection) {
				return collection.invokeThen('fetch');
			});
	}
});
