var chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	Event = require('./event'),
	Picture = require('./picture'),
	Pictures = Picture.Set,
	IssueComment = require('./issue-comment'),
	IssueComments = IssueComment.Set,
	tbIssue = 'issues',
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

	created: function (model) {
		return Issue.__super__.created.apply(this, arguments)
			.then(function () {
				return model.user().fetch()
					.then(function (user) {
						var message = user.related('profile').get('name') + ' 发布了话题 <' + model.get('title') + '>';
						Event.add(user.id, model.get('groupid'), 'issue', model.id, message);
					});
			});
	},
	fetched: function (model, resp, options) {
		return Issue.__super__.fetched.apply(this, arguments)
			.return(model).call('countComments')
			.call('countPictures')
			.call('cutFields', (function (query) {
				return {
					body: +query['bodylimit'] || Infinity
				};
			})(options.req && options.req.query || {}))
			.then(function () {
				return model.related('pictures').fetch();
			}).then(function () {
				if (!options['detailed']) return;
				return model.related('comments')	// for detail
					.query(function (qb) {
						qb.orderBy('id', 'desc');
					}).fetch();
			});
	},

	user: function () {
		return this.belongsTo(require('./user'), 'userid');
	},
	comments: function () {
		return this.hasMany(IssueComment, 'issueid');
	},
	pictures: function () {
		return this.hasMany(Picture, 'issueid');
	},

	countComments: function () {
		var self = this;
		return IssueComments.forge().query()
			.where('issueid', '=', self.id)
			.count('id')
			.then(function (d) {
				return self.data('numComments', d[0]["count(`id`)"]);
			});
	},
	countPictures: function () {
		var self = this;
		return Pictures.forge().query()
			.where('issueid', '=', self.id)
			.count('id')
			.then(function (d) {
				return self.data('numPictures', d[0]["count(`id`)"]);
			})
	}

}, {
	randomForge: function () {
		return Issue.forge({
			title: chance.sentence(),
			body: chance.paragraph(),
			posttime: chance.date({ year: 2013 })
		});
	}
});

Issues = Issue.Set = syBookshelf.Collection.extend({
	model: Issue,

	lister: function (req, qb) {
		var query = req.query;
		this.allowNull(req.query, ['groupid', 'activityid']) //如果没有传值，就要给他取null
			.qbWhere(qb, req, query, ['id', 'userid', 'groupid', 'activityid'], tbIssue);
		if (!req.query['fuzzy']) {
			this.qbWhere(qb, req, query, ['title'], tbIssue);
		} else {
			this.qbWhereLike(qb, req, query, ['title', 'body'], tbIssue);
		}
	}
});
