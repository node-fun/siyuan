/**
 * Created by fritz on 1/11/14.
 */
var syBookshelf = require('./base'),
	IssueComment, IssueComments;

IssueComment = module.exports = syBookshelf.Model.extend({
	tableName: 'issue_comments',
	fields: ['id', 'issueid', 'body', 'posttime'],
	omitInJSON: ['id', 'issueid'],

	defaults: function () {
		return {
			body: '',
			posttime: new Date()
		};
	}
});

IssueComments = IssueComment.Set = syBookshelf.Collection.extend({
	model: IssueComment
});
