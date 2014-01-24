/**
 * Created by cin on 1/24/14.
 */
var chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	CoComment, CoComments;

CoComment = module.exports = syBookshelf.Model.extend({
	tableName: 'co_comments',
	fields: ['id', 'cooperationid', 'userid', 'body', 'posttime'],
	defaults: function () {
		return {
			body: '',
			posttime: new Date()
		}
	},
	user: function () {
		return CoComment.forge({
			body: chance.sentence(),
			posttime: chance.date({ year: 2013 })
		});
	}
}, {
	randomForge: function () {
		return CoComment.forge({
			body: chance.sentence(),
			posttime: chance.date({ year: 2013 })
		});
	}
});

CoComments = CoComment.Set = syBookshelf.Collection.extend({
	model: CoComment
});