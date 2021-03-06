var chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	ActivityStatus, ActivityStatuses;

ActivityStatus = module.exports = syBookshelf.Model.extend({
	tableName: 'activity_status',
	fields: ['id', 'name']
}, {
	randomForge: function () {
		return ActivityStatus.forge({
			name: chance.name()
		});
	}
});

ActivityStatuses = ActivityStatus.Set = syBookshelf.Collection.extend({
	model: ActivityStatus
});