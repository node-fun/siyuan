var Promise = require('bluebird'),
	chance = new (require('chance'))(),
	errors = require('../lib/errors'),
	syBookshelf = require('./base'),
	Event = require('./event'),
	IssueComment = require('./issue-comment'),
	IssueComments = IssueComment.Set,
	Issue, Issues;

Issue = module.exports = syBookshelf.Model.extend({
	tableName: 'issues',
	fields: [
		'id', 'userid', 'groupid', 'activityid', 'title', 'body', 'posttime'
	],
	omitInJSON: ['userid'],
	appended: ['user'],

	defaults: function () {
		return {
			title: '',
			body: '',
			groupid: null,
			activityid: null,
			posttime: new Date()
		};
	},

	created: function () {
		var self = this;
		return Issue.__super__.created.apply(this, arguments)
			.then(function () {
				return self.user().fetch()
					.then(function (user) {
						var message = user.related('profile').get('name') + ' 发表了话题 <'+ self.get('title') +'>';
						Event.add(user.id, self.get('groupid'), 'issue', self.id, message);
						return self;
					});
			});
	},
	fetched: function (model) {
		return Issue.__super__.fetched.apply(this, arguments)
			.then(function () {
				return model.countComments();
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

	view: function (query) {
		return Issue.forge({ id: query['id'] })
			.fetch({
				withRelated: ['user.profile']
			}).then(function (issue) {
				if (!issue) return Promise.rejected(errors[20603]);
				return IssueComments.forge()
					.query(function (qb) {
						qb.where('issueid', '=', issue.id);
						qb.orderBy('posttime', 'desc');
					}).fetch().then(function (comments) {
						return issue.set('comments', comments);
					});
			});
	}
});

Issues = Issue.Set = syBookshelf.Collection.extend({
	model: Issue,

	lister: function (req, qb) {
		this.allowNull(req.query, ['groupid', 'activityid']) //如果没有传值，就要给他取null
			.qbWhere(qb, req, req.query, ['id', 'userid']);
		if (!req.query['fuzzy']) {
			this.qbWhere(qb, req, req.query, ['title']);
		} else {
			this.qbWhereLike(qb, req, req.query, ['title', 'body']);
		}
	}
});
