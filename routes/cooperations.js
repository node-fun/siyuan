var _ = require('underscore'),
	Promise = require('bluebird'),
	Cooperation = require('../models/cooperation'),
	errors = require('../lib/errors');

module.exports = function (app) {
	app.get('/api/cooperations/find', function (req, res, next) {
		Cooperation.find(req.query)
			.then(function (cooperations) {
				cooperations.mapThen(function (cooperation) {
					return cooperation.load(['status']);
				})
				.then(function (cooperations) {
					next({
						cooperations: cooperations
					});
				});

			}).catch(next);
	});

	app.get('/api/cooperations/create', function(req, res, next) {
		var ownerid = 1,//session['userid'],
			name = req.body.name,
			description = req.body.description,
			company = req.body.company,
			deadline = req.body.deadline,
			statusid = req.body.statusid,
			isprivate = req.body.isprivate;
		Cooperation.forge().createCooperation(ownerid, name, description, company, deadline, statusid, isprivate)
			.then(function (cooperation) {
				next({
					msg: 'create success',
					id: cooperation.get('id')
				});
			}).catch(next);
	});
}