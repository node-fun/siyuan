/**
 * Created by fritz on 1/20/14.
 */
var _ = require('underscore'),
	Promise = require('bluebird'),
	errors = require('./errors'),
	Entity, Entities;

Entity = module.exports = {};
var names = Entity.names = {
	'1': 'user',
	'2': 'issue',
	'3': 'activity',
	'4': 'cooperation'
};

// forge here returns a promise
Entity.forge = function (type, data) {
	var Model = require('../models/' + names[type]);
	if (!Model) return Promise.reject(errors[20604]);
	return Promise.resolve(Model.forge(data));
};

Entities = Entity.Set = {};
Entities.forge = function (type, data) {
	var Model = names[type];
	if (!Model) return Promise.reject(errors[20604]);
	return Promise.resolve(Model.Set.forge(data));
};
