/**
 * Created by cin on 1/20/14.
 */
var _ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	UserCooperation, UserCooperations;

UserCooperation = module.exports = syBookshelf.Model.extend({
	tableName: 'user_cooperation',
	fields: [
		'id', 'userid', 'cooperationid', 'isaccepted'
	]
}, {

});

UserCooperations = UserCooperation.Set = syBookshelf.Collection.extend({
	model: UserCooperation
});