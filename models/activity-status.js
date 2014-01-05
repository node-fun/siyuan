var _ = require('underscore'),
	chance = new (require('chance'))(),
	errors = require('../lib/errors'),
	encrypt = require('../lib/encrypt'),
	syBookshelf = require('./base'),
	ActivitySattus, ActivitySattuses;

ActivitySattus = module.exports = syBookshelf.Model.extend({
	tableName: 'activity_status',
	fields: ['id', 'name'],
	initialize: function () {
		return ActivitySattus.__super__.initialize.apply(this, arguments);
	},

	saving: function () {
		return ret = ActivitySattus.__super__.initialize.apply(this, arguments);
	}
}, {
	randomForge: function () {
		return ActivitySattus.forge({
			name: chance.name()
		});
	}
});

ActivitySattuses = ActivitySattus.Set = syBookshelf.Collection.extend({
	model: ActivitySattus
});