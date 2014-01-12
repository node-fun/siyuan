/**
 * Created by Cam on 14-1-4.
 */
var chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	User = require('./user'),
	GroupMembership, GroupMembersSet;

GroupMembership = module.exports = syBookshelf.Model.extend({
	tableName: 'group_membership',
	fields: [
		'id', 'groupid', 'userid', 'isowner', 'isadmin', 'remark'
	],
	defaults: function(){
		return {
			isowner: 0,
			isadmin: 0
		};
	},
	omitInJSON: ['id','groupid'],
	profile: function(){
		return this.belongsTo(User, 'userid');
	}
}, {
	randomForge: function () {
		return GroupMembership
			.forge({
				'groupid': chance.integer({
					min: 1,
					max: 20
				}),
				'userid': chance.integer({
					min: 25,
					max: 50
				}),
				'isowner': chance.bool(),
				'isadmin': chance.bool(),
				'remark': chance.word()
			});
	}
});

GroupMembersSet = GroupMembership.Collection = syBookshelf.Collection.extend({
	model: GroupMembership
});
