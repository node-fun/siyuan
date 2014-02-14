/**
 * Created by fritz on 1/11/14.
 */
var chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	IssueComment, IssueComments;

IssueComment = module.exports = syBookshelf.Model.extend({
	tableName: 'issue_comments',
	fields: ['id', 'issueid', 'userid', 'body', 'posttime'],
	omitInJSON: ['id', 'userid', 'issueid'],
	withRelated: ['user.profile'],

	defaults: function () {
		return {
			body: '',
			posttime: new Date()
		};
	},
	user: function () {
		return this.belongsTo(require('./user'), 'userid');
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
	model: IssueComment,

	fetch: function () {
		return IssueComments.__super__.fetch.apply(this, arguments)
			.then(function (collection) {
				return collection.invokeThen('fetch')
					.then(function(){
						return collection;
					});
			});
	}
});
