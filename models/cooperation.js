/**
 * Created by cin on 1/18/14.
 */
/**
 * Created by cin on 1/18/14.
 */
var fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	Promise = require('bluebird'),
	errors = require('../lib/errors'),
	syBookshelf = require('./base'),
	User = require('./user'),
	Users = User.Set,
	CoStatus = require('./co-status'),
	CoStatuses = CoStatus.Set,
	UserCooperation = require('./user-cooperation'),
	UserCooperations = UserCooperation.Set,
	GroupMember = require('./group-membership'),
	GroupMembers = GroupMember.Set,
	Cooperation, Cooperations,
	fkStatus = 'statusid',
	fkCooperation = 'cooperationid',
	fkOwner = 'ownerid';

Cooperation = module.exports = syBookshelf.Model.extend({
	tableName: 'cooperations',
	fields: [
		'id', 'name', 'description', 'company', 'deadline', 'avatar', 'statusid', 'ownerid', 'isprivate'
	],
	saving: function () {
		return Cooperation.__super__
			.saving.apply(this, arguments);
	},

	usership: function () {
		return this.hasMany(UserCooperations, fkCooperation);
	},

	countUsership: function () {
		var self = this;
		UserCooperations.forge().query()
			.where(fkCooperation, '=', self.id)
			.count('id')
			.then(function (d) {
				return self.data('numUsership', d[0]["count(`id`)"]);
			});
	},

	status: function () {
		return this.belongsTo(CoStatus, fkStatus);
	},
	user: function () {
		return this.belongsTo(User, fkOwner);
	},

	createCooperation: function (ownerid, name, description, company, deadline, statusid, isprivate) {
		if (ownerid == null) return Promise.rejected(errors[40001]);
		return Cooperation.forge({
			'name': name,
			'ownerid': ownerid,
			'description': description,
			'company': company,
			'deadline': deadline,
			'statusid': statusid,
			'isprivate': isprivate
		}).save();
	},

	updateCooperation: function (userid, name, description, company, deadline, statusid, isprivate) {

		var ownerid = this.get('ownerid');
		if (userid != ownerid) {
			return Promise.rejected(errors[20102]);
		}
		if (userid == null) {
			return Promise.rejected(errors[21301]);
		}
		return this.set({
			'name': name,
			'description': description,
			'company': company,
			'deadline': deadline,
			'statusid': statusid,
			'isprivate': isprivate
		}).save();
	},

	getUserList: function () {
		var self = this,
			id = self.get('id');
		return self.load(['usership']).then(function (cooperation) {
			var userships = cooperation.related('usership');
			return userships.mapThen(function (usership) {
				return User.forge({ 'id':usership.get('userid') })
					.fetch()
					.then(function (user) {
						return usership.set({ 'name': user.get('username') });
					});
			}).then(function (userships) {
					return userships;
				});
		});
	},

	acceptJoin: function (userid, usershipid) {
		var self = this,
			ownerid = self.get('ownerid');
		if (userid != ownerid) return Promise.rejected(errors[20102]);
		return UserCooperation.forge({ 'id': usershipid }).fetch()
			.then(function (usership) {
				return usership.set({ 'isaccepted': true }).save();
			});
	},

	joinCooperation: function (userid) {
		//check the cooperation isprivate
		var self = this,
			isprivate = this.get('isprivate'),
			id = this.get('id'),
			ownerid = this.get('ownerid');

		var isfounded = false,
			theGroupid = [];

		//check if already apply
		return UserCooperation.forge({
					'userid': userid,
					'cooperationid': id
				}).fetch()
				.then(function (usercooperation) {
					if (usercooperation != null) return Promise.rejected(errors[40002]);
					if (!isprivate) {
						return UserCooperation.forge({
							'userid': userid,
							'cooperationid': id,
							'isaccepted': false
						}).save();
					} else {
						//check the user if in the same group

						return GroupMembers.forge()
							.query(function (qb) {
								qb.where('userid', ownerid);
							}).fetch()
							.then(function (groupmembers) {
								return groupmembers.mapThen(function (groupmember) {
									var groupid = groupmember.get('groupid');
									return GroupMember.forge({
										'userid': userid,
										'groupid': groupid
									})
									.fetch()
									.then(function (groupmember) {
										if (groupmember != null) {
											isfounded = true;
											theGroupid.push(groupmember.get('groupid'));
										}
									});
								}).then(function (groupmembers) {
										if(!isfounded) return Promise.rejected(errors[21301]);
										return UserCooperation.forge({
											'userid': userid,
											'cooperationid': id,
											'isaccepted': false
										}).save();
								});
							});
					}
				});
	},
	cancelCooperation: function (userid) {
		var self = this;
		if (userid == null) {
			return Promise.rejected(errors[21301]);
		}
		return self.load(['usership']).then(function (cooperation) {
			var userships = cooperation.related('usership').models,
				isfounded = false;
			_.each(userships, function (usership) {
				if (usership.get('userid') == userid) {
					isfounded = true;
				}
			});
			if (isfounded)
				return UserCooperation.forge({
					'userid': userid,
					'cooperationid': self.get('id')
				}).fetch()
				.then(function (usership) {
					if (usership.get('isaccepted') == 1)
						return Promise.rejected(errors[40016]);
					return usership.destroy();
				})
		});
	},

	endCooperation: function (userid) {
		if (userid == null) {
			return Promise.rejected(errors[21301]);
		}
		var self = this;
		return self.load(['usership']).then(function (cooperation) {
			if (!(self.get('ownerid') == userid)) {
				return Promise.rejected(errors[20102]);
			}
			return self.set({
				'statusid': 2
			}).save();
		});

	}
}, {
	randomForge: function () {
		var status = _.random(1, 2);
		return Cooperation.forge({
			'name': chance.word(),
			'description': chance.paragraph(),
			'ownerid': chance.integer({
				min: 1,
				max: 20
			}),
			'company': chance.word(),
			'deadline': chance.date({ year: 2013 }),
			'avatar': chance.word(),
			'statusid': status,
			'isprivate': chance.bool()
		});
	},

	find: function (query) {
		var forCooperation = ['id', 'name', 'company', 'statusid'],
			cooperations = Cooperations.forge();
		return cooperations
			.query(function (qb) {
				_.each(forCooperation, function (k) {
					if (k in query) {
						qb.where(k, query[k]);
					}
				});
			})
			.query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch({
				withRelated: ['user.profile']
			});
	}
});

Cooperations = Cooperation.Set = syBookshelf.Collection.extend({
	model: Cooperation
});