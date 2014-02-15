/**
 * Created by fritz on 1/11/14.
 */
var chance = new (require('chance'))(),
	requireFn = require('../lib/requireFn'),
	syBookshelf = require('./base'),
	User = requireFn('./user'),
	IssueComment, IssueComments;

IssueComment = module.exports = syBookshelf.Model.extend({
	tableName: 'issue_comments',
	fields: ['id', 'issueid', 'userid', 'body', 'posttime'],
	omitInJSON: ['userid', 'issueid'],
	withRelated: ['user.profile'],

	defaults: function () {
		return {
			body: '',
			posttime: new Date()
		};
	},
	user: function () {
		return this.belongsTo(User(), 'userid');
	}
}, {
	randomForge: function () {
		return IssueComment.forge({
			body: chance.sentence(),
			posttime: chance.date({ year: 2013 })
		});
	}
});

IssueComments = IssueComment.Set = syBookshelf.Collection.extend({
	model: IssueComment
});
