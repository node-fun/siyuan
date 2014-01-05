/**
 * Created by Cam on 14-1-4.
 */
var syBookshelf = require('./base'),
	GroupMembers, GroupMembersSet;

GroupMembers = module.exports = syBookshelf.Model.extend({
	tableName: 'group_members',
	fields: [
		'id', 'groupid', 'isowner', 'isadmin', 'remark'
	],
	omitInJSON: ['id']
});

GroupMembersSet = GroupMembers.Collection = syBookshelf.Collection.extend({
	model: GroupMembers
});
