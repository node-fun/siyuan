var _ = require('underscore'),
	Promise = require('bluebird'),
	Cooperation = require('../models/cooperation'),
	errors = require('../lib/errors');

module.exports = function (app) {
	app.get('/api/cooperations/find', function (req, res, next) {
		Cooperation.find(req.query)
			.then(function (cooperations) {
				next({
					cooperations: cooperations
				});
			}).catch(next);
	});
}