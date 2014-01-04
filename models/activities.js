var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	Activity, Activities;

Activity = modele.exports = syBookshelf.Model.extend({
	tableName: 'activities',
	fields: [
		'ownerid', 'groupid', 'content', 'maxnum', 'createtime',
		'starttime', 'duration', 'statusid'
	],
	omitInJSON: ['ownerid', 'groupid']
	saving: function() {
		return Activity.__super__
			.saving.apply(this, arguments);
	}
}, {
	randomForge: function() {
		return Activity.forge({
			'ownerid': ''
		});
	}
});