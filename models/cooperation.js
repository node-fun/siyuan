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
	errors = require('./base'),
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
	fkStatus = 'statusid';

Cooperation = module.exports = syBookshelf.Model.extend({
	tableName: 'cooperations',
	fields: [
		'id', 'name', 'description', 'company', 'deadline', 'avatar', 'statusid', 'ownerid', 'isprivate'
	],
	saving: function () {
		return Cooperation.__super__
			.saving.apply(this, arguments);
	},
	status: function () {
		return this.belongsTo(CoStatus, fkStatus);
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

	joinCooperation: function (userid) {
		//check the cooperation isprivate
		var self = this,
			isprivate = this.get('isprivate'),
			id = this.get('id'),
			ownerid = this.get('ownerid');

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
						GroupMembers.forge()
							.query(function (qb) {
								qb.where('userid', ownerid);
							}).fetch()
							.then(function (groupmembers) {
								groupmembers.mapThen(function (groupmember) {

								})
							});
					}
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
			'deadline': chance.date({ string: true }),
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
			.fetch();
	}
});

Cooperations = Cooperation.Set = syBookshelf.Collection.extend({
	model: Cooperation
});