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

function Source(data) {
	this.typeid = data['typeid'];
	this.srcid = data['srcid'];
}
Source.forge = function (data) {
	return new Source(data);
};

Source.prototype.fetch = function () {
	var Model = types[this.typeid];
	if (!Model) return Promise.rejected(errors[20604]);
	var resource = Model.forge({ id: this.srcid });
	return resource.fetch.apply(resource, arguments);
};

module.exports = Source;
