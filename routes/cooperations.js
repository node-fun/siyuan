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

	app.post('/api/cooperations/create', function(req, res, next) {
		var ownerid = req.session['userid'],
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

	app.get('/api/cooperations/update', function(req, res, next) {
		var userid = 1,//req.session['userid'],
			id = req.body.id,
			name = req.body.name,
			description = req.body.description,
			company = req.body.company,
			deadline = req.body.deadline,
			statusid = req.body.statusid,
			isprivate = req.body.isprivate;
		Cooperation.forge({ 'id': id }).fetch()
			.then(function (cooperation) {
				cooperation.updateCooperation(userid, name, description, company, deadline, statusid, isprivate)
				.then(function (cooperation) {
					next({
						msg: 'update success',
						id: cooperation.get('id')
					});
				}).catch(next);
		});

	});
}