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
	Cooperation, Cooperations;

Cooperation = module.exports = syBookshelf.Model.extend({
	tableName: 'cooperations',
	fields: [
		'id', 'name', 'company', 'deadline', 'avatar', 'statusid'
	],
	saving: function () {
		return Cooperation.__super__
			.saving.apply(this, arguments);
	}
}, {
	randomForge: function () {
		var status = _.random(1, 2);
		return Cooperation.forge({
			'name': chance.word(),
			'company': chance.word(),
			'deadline': chance.date({ string: true }),
			'avatar': chance.word(),
			'statusid': status
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