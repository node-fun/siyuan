/**
 * Created by Cam on 14-1-2.
 */
var syBookshelf = require('./base'),
	GroupMember = require('./group-membership'),
	Activity = require('./activity'),
	path = require('path'),
	fkGroup = 'groupid',
	Group, Groups;

Group = module.exports = syBookshelf.Model.extend({
	tableName: 'groups',
	fields: [
		'id', 'ownerid', 'name', 'description', 'createtime', 'avatar'
	],
	omitInJSON: ['_pivot_userid', '_pivot_groupid'],
	fieldToAssets: { avatar: 'groups' },

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
	countMembership: function () {
		var self = this;
		return GroupMember.forge().query()
			.where(fkGroup, '=', this.id)
			.count('id')
			.then(function (d) {
				return self.data('numMembers', d[0]["count(`id`)"]);
			});
	},
	activities: function () {
		return this.hasMany(Activity, fkGroup);
	},
	countActivities: function () {
		var self = this;
		return Activity.forge().query()
			.where(fkGroup, '=', this.id)
			.count('id')
			.then(function (d) {
				return self.data('numActivities', d[0]["count(`id`)"]);
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
