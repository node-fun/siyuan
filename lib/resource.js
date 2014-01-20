/**
 * Created by fritz on 1/20/14.
 */
var _ = require('underscore'),
	Promise = require('bluebird'),
	errors = require('./errors'),
	Issue = require('../models/issue'),
	Activity = require('../models/activity'),
	Cooperation = require('../models/cooperation');

var types = {};
types[1] = Issue;
types[2] = Activity;
types[3] = Cooperation;

function Resource(data) {
	this.typeid = data['itemtype'];
	this.itemid = data['itemid'];
}
Resource.forge = function (data) {
	return new Resource(data);
};

Resource.prototype.fetch = function () {
	var Model = types[this.typeid];
	if (!Model) return Promise.rejected(errors[20604]);
	var resource = Model.forge({ id: this.itemid });
	return resource.fetch.apply(resource, arguments);
};

module.exports = Resource;
