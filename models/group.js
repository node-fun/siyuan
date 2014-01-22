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
	owner: function () {
		return this.belongsTo(require('./user'), 'ownerid');
	},
	memberships: function () {
		return this.hasMany(GroupMember, fkGroup);
	},
	countMembership: function(){
		var self = this;
		return this.memberships()
			.fetch()
			.then(function(membershipSet){
			return self.data('numMembers', membershipSet.length);
		});
	},
	fetch: function () {
		return Group.__super__.fetch.apply(this, arguments)
			.then(function (group) {
				if (!group) return group;
				return group.countMembership();
			});
	}
});

Groups = Group.Set = syBookshelf.Collection.extend({
	model: Group
});