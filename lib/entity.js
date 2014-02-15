/**
 * Created by fritz on 1/20/14.
 */
var _ = require('underscore'),
	Promise = require('bluebird'),
	errors = require('./errors'),
	config = require('../config'),
	entities = config.entities,
	Entity, Entities;

Entity = module.exports = {};

Entity.getModelName = function (type) {
	return entities[type - 1] || null;
};

/**
 * for loading circular module correctly
 * returns a promise
 */
Entity.getModel = function (type) {
	var modelName = this.getModelName(type);
	if (modelName == null) {
		return Promise.reject(errors[20604]);
	}
	// no worry, module has a cache
	var Model = require('../models/' + modelName);
	return Promise.resolve(Model);
};

/**
 * forge here returns a promise
 */
Entity.forge = function (type, data) {
	return this.getModel(type)
		.then(function (Model) {
			return Model.forge(data);
		});
};

Entities = Entity.Set = {};
Entities.forge = function (type, data) {
	return this.getModel(type)
		.then(function (Model) {
			return Model.Set.forge(data);
		});
};
