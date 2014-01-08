var _ = require('underscore'),
	chance = new (require('chance'))(),
	errors = require('../lib/errors'),
	encrypt = require('../lib/encrypt'),
	syBookshelf = require('./base'),
	ActivityStatus, ActivityStatuses;

ActivityStatus = module.exports = syBookshelf.Model.extend({
	tableName: 'activity_status',
	fields: ['id', 'name'],
	initialize: function () {
		return ActivityStatus.__super__.initialize.apply(this, arguments);
	},

	saving: function () {
		return ret = ActivityStatus.__super__.initialize.apply(this, arguments);
	}
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