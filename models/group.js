/**
 * Created by Cam on 14-1-2.
 */
var syBookshelf = require('./base'),
	GroupMember = require('./group-membership'),
	Activity = require('./activity'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	Promise = require('bluebird'),
	config = require('../config'),
	path = require('path'),
	fs = require('fs-extra'),
	fkGroup = 'groupid',
	Group, Groups;

Group = module.exports = syBookshelf.Model.extend({
	tableName: 'groups',
	fields: [
		'id', 'ownerid', 'name', 'description', 'createtime', 'avatar'
	],
	omitInJSON: ['_pivot_userid', '_pivot_groupid'],
	defaults: function () {
		return {
			createtime: new Date()
		};
	},
	toJSON: function () {
		var ret = Group.__super__.toJSON.apply(this, arguments),
			self = this;
		// to uri if exists
		if (self.get('avatar')) {
			ret['avatar'] = Group.getAvatarURI(self.id);
		}
		return ret;
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
	},
	updateAvatar: function (tmp) {
		var file = Group.getAvatarPath(this.id),
			self = this;
		return new Promise(
			function (resolve, reject) {
				fs.copy(tmp, file, function (err) {
					if (err) return reject(errors[30003]);
					resolve();
				});
			}).then(function () {
				return self.set('avatar', Date.now()).save()
					.then(function () {
						return self;
					});
			}).catch(function (err) {
				return self.set('avatar', null).save()
					.then(function () {
						return Promise.rejected(err);
					});
			});
	}
},{
	getAvatarPath: function (id) {
		return path.join( config['groupDir'], id + config.avatarExt);
	},
	getAvatarURI: function (id) {
		return config['groupStaticDir'] +'/'+ id + config.avatarExt;
	}
});

Groups = Group.Set = syBookshelf.Collection.extend({
	model: Group
});