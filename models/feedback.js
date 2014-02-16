var syBookshelf = require('./base'),
	tbFeedback = 'feedback',
	Feedback, Feedbacks;

Feedback = module.exports = syBookshelf.Model.extend({
	tableName: tbFeedback,
	fields: [
		'id', 'userid', 'type', 'title', 'body', 'versioncode', 'device', 'posttime'
	],
	defaults: function () {
		return {
			posttime: new Date()
		};
	}
})

Feedbacks = Feedback.Set = syBookshelf.Collection.extend({
	model: Feedback
}, {
	
});