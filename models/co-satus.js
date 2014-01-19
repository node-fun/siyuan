/**
 * Created by cin on 1/19/14.
 */
var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	CoStatus, CoStatuses;

CoStatus = module.exports = syBookshelf.Model.extend({
	tableName: 'co_status',
	fields: ['id', 'name']
});

CoStatuses = CoStatus.Set = syBookshelf.Collection.extend({
	model: CoStatus
});