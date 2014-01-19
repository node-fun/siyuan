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
			'statusid': statusid
		}).save();
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