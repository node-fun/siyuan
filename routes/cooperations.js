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
	Users = User.Set;

Cooperation = module.exports = syBookshelf.Model.extend({
	tableName: ''
});