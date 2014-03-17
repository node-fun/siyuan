/**
 * Created by fritz on 1/11/14.
 */
var chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	Starship = require('./starship'),
	IssueComment, IssueComments;

IssueComment = module.exports = syBookshelf.Model.extend({
	tableName: 'issue_comments',
	fields: ['id', 'issueid', 'userid', 'body', 'posttime'],
	omitInJSON: ['userid', 'issueid'],
	appended: ['user'],

	defaults: function () {
		return {
			body: '',
			posttime: new Date()
		};
	},
	user: function () {
		return this.belongsTo(require('./user'), 'userid');
	},

	saved: function (model) {
		return IssueComment.__super__.saved.apply(this, arguments)
			.then(function () {
				// auto star
				return Starship.forge({
					itemtype: 2,
					itemid: model.get('issueid'),
					userid: model.get('userid')
				}).save()
					.catch(function (err) {
						if (!/^ER_DUP_ENTRY/.test(err.message)) {
							throw err;
						}
					});
			});
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
