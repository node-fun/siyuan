/**
 * Created by Cam on 14-1-2.
 */
var syBookshelf = require('./base'),
	GroupMember = require('./group-membership'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	Promise = require('bluebird'),
	fkGroup = 'groupid',
	Group, Groups;

Group = module.exports = syBookshelf.Model.extend({
	tableName: 'groups',
	fields: [
		'id', 'ownerid', 'name', 'description', 'createtime', 'avatar'
	],
	defaults: function () {
		return {
			createtime: new Date()
		};
	},
	//omitInJSON: ['id'],
	memberships: function () {
		return this.hasMany(GroupMember, fkGroup);
	}
});

Groups = Group.Set = syBookshelf.Collection.extend({
	model: Group
});