var syBookshelf = require('./base'),
	tbFeedback = 'feedback',
	Feedback, Feedbacks;

Feedback = module.exports = syBookshelf.Model.extend({
	tableName: tbFeedback,
	fields: [
		'id', 'userid', 'type', 'title', 'body', 'versioncode', 'device', 'posttime'
	],
	omitInJSON: ['userid'],
	appended: ['user'],

	defaults: function () {
		return {
			posttime: new Date()
		};
	},
	user: function () {
		return this.belongsTo(require('./user'), 'userid');
	}
});

Feedbacks = Feedback.Set = syBookshelf.Collection.extend({
	model: Feedback,

	lister: function (req, qb) {
		this.qbWhere(qb, req, req.query, ['id', 'userid', 'type', 'versioncode', 'device'], tbFeedback);
	}
});
