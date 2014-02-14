/**
 * Created by fritz on 1/20/14.
 */
var _ = require('underscore'),
	Promise = require('bluebird'),
	errors = require('./errors'),
	User = require('../models/user'),
	Issue = require('../models/issue'),
	Activity = require('../models/activity'),
	Cooperation = require('../models/cooperation'),
	Entity, Entities;

Entity = module.exports = {};
var models = Entity.models = {};
models[1] = User;
models[2] = Issue;
models[3] = Activity;
models[4] = Cooperation;

// forge here returns a promise
Entity.forge = function (type, data) {
	var Model = models[type];
	if (!Model) return Promise.reject(errors[20604]);
	return Promise.resolve(Model.forge(data));
};

Entities = Entity.Set = {};
Entities.forge = function (type, data) {
	var Model = models[type];
	if (!Model) return Promise.reject(errors[20604]);
	return Promise.resolve(Model.Set.forge(data));
};
