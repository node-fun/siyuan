/**
 * Created by fritz on 1/10/14.
 */
var _ = require('underscore'),
	Promise = require('bluebird'),
	Issue = require('../models/issue'),
	IssueComment = require('../models/issue-comment'),
	errors = require('../lib/errors');

module.exports = function (app) {
	app.get('/api/issues/find', function (req, res, next) {
		Issue.find(req.query)
			.then(function (issues) {
				next({ issues: issues });
			}).catch(next);
	});
	app.get('/api/issues/search', function (req, res, next) {
		Issue.search(req.query)
			.then(function (issues) {
				next({ issues: issues });
			}).catch(next);
	});
	app.get('/api/issues/view', function (req, res, next) {
		Issue.view(req.query)
			.then(function (issue) {
				next({ issue: issue });
			}).catch(next);
	});

	app.post('/api/issues/post', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		delete req.body['id'];
		Issue.forge(_.extend(req.body, { userid: user.id })).save()
			.then(function (issue) {
				next({
					msg: 'Issue posted',
					id: issue.id
				});
			}).catch(next);
	});
	app.post('/api/issues/update', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		var id = req.body['id'];
		delete req.body['id'];
		Issue.forge({ id: id }).fetch()
			.then(function (issue) {
				if (!issue) return Promise.rejected(errors[20603]);
				if (issue.get('userid') != user.id) {
					return Promise.rejected(errors[20102]);
				}
				return issue.set(req.body).save();
			}).then(function () {
				next({ msg: 'Issue updated' });
			}).catch(next);
	});
	app.post('/api/issues/delete', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		Issue.forge({ id: req.body['id'] }).fetch()
			.then(function (issue) {
				if (!issue) return Promise.rejected(errors[20603]);
				if (issue.get('userid') != user.id) {
					return Promise.rejected(errors[20102]);
				}
				return issue.destroy();
			}).then(function () {
				next({ msg: 'Issue deleted' });
			}).catch(next);
	});

	app.post('/api/issues/comment', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		var issueid = ~~req.body['id'];
		delete req.body['id'];
		Issue.forge({ id: issueid }).fetch()
			.then(function (issue) {
				if (!issue) throw errors[20603];
			}).then(function () {
				IssueComment.forge(_.extend(req.body, {
						issueid: issueid,
						userid: user.id
					})).save()
					.then(function (comment) {
						next({
							msg: 'Issue commented',
							id: comment.id
						});
					}).catch(next);
			});
	});
};
