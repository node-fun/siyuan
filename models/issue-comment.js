/**
 * Created by fritz on 1/11/14.
 */
var syBookshelf = require('./base'),
	IssueComment, IssueComments;

IssueComment = module.exports = syBookshelf.Model.extend({
	tableName: 'issue_comments',
	fields: ['id', 'issueid', 'userid', 'body', 'posttime'],
	omitInJSON: ['id', 'userid', 'issueid'],

	defaults: function () {
		return {
			body: '',
			posttime: new Date()
		};
	},

	user: function () {
		return this.belongsTo(require('./user'), 'userid');
	}
});

IssueComments = IssueComment.Set = syBookshelf.Collection.extend({
	model: IssueComment
});
