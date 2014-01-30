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
	toJSON: function () {
		var ret = Group.__super__.toJSON.apply(this, arguments),
			self = this;
		// to uri if exists
		['avatar'].forEach(function (type) {
			if (self.get(type)) {
				ret[type] = Group.getPicURI(type, self.id);
			}
		});
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
	fetch: function () {
		return Group.__super__.fetch.apply(this, arguments)
			.then(function (group) {
				if (!group) return group;
				return group.countMembership();
			});
	},
	updateAvatar: function (tmp) {
		var file = path.join( config['avatarDir'], this.id + config.avatarExt),
			self = this;
		return new Promise(
			function (resolve, reject) {
				fs.copy(tmp, file, function (err) {
					if (err) return reject(errors[30003]);
					resolve();
				});
			}).then(function () {
				return self.set('avatar', self.id).save()
					.then(function () {
						return self;
					});
			}).catch(function (err) {
				return self.set(type, null).save()
					.then(function () {
						return Promise.rejected(err);
					});
			});
	}
},{
	getPicURI: function (type, id) {
		return path.join( config[type+'Dir'], id + config.avatarExt);
	}
});

Groups = Group.Set = syBookshelf.Collection.extend({
	model: Group
});