/**
 * Created by fritz on 1/10/14.
 * @class 话题
 */
var _ = require('underscore'),
	Issue = require('../models/issue'),
	Issues = Issue.Set,
	Picture = require('../models/picture'),
	Pictures = Picture.Set,
	IssueComment = require('../models/issue-comment'),
	mail = require('../lib/mail'),
	errors = require('../lib/errors');

module.exports = function (app) {
	/**
	 * GET /api/issues/list
	 * @method 话题列表
	 * @param {Number} [id] 话题ID
	 * @param {Number} [userid] 作者ID
	 * @param {String} [title] 标题
	 * @param {String} [body] 内容 (仅限搜索)
	 * @param {String} [groupid] 圈子id，不传值表示校友交流，传值表示圈内分享
	 * @param {String} [activityid] 活动id，不传值表示校友交流，传值表示活动分享
	 * @return {JSON}
	 */
	app.get('/api/issues/list', function (req, res, next) {
		Issues.forge().fetch({ req: req })
			.then(function (issues) {
				next({ issues: issues });
			}).catch(next);
	});

	/**
	 * GET /api/issues/my
	 * @method 获得我的话题列表
	 * @param {Number} [id] 话题ID
	 * @param {String} [title] 标题
	 * @param {String} [body] 内容 (仅限搜索)
	 * @param {String} [groupid] 圈子id，不传值表示校友交流，传值表示圈内分享
	 * @param {String} [activityid] 活动id，不传值表示校友交流，传值表示活动分享
	 * @return {JSON}
	 */
	app.get('/api/issues/my', function (req, res, next) {
		if (!req.user) return next(errors(21301));
		req.query = _.omit(req.query, ['id']);
		req.query['userid'] = req.user.id;
		Issues.forge().fetch({ req: req })
			.then(function (issues) {
				next({ issues: issues });
			}).catch(next);
	});

	/**
	 * GET /api/issues/view
	 * @method 话题详情
	 * @param {Number} id 话题ID
	 * @return {JSON}
	 */
	app.get('/api/issues/view', function (req, res, next) {
		Issue.forge({ id: req.query['id'] })
			.fetch({ req: req, detailed: true })
			.then(function (issue) {
				next({ issue: issue });
			}).catch(next);
	});

	/**
	 * POST /api/issues/post <br/>
	 * 注意：groupid与activityid是二选一的
	 * @method 发布话题
	 * @param {String} title 标题
	 * @param {String} body 内容
	 * @param {String} [groupid] 圈子id，不传值表示校友交流，传值表示圈内分享
	 * @param {String} [activityid] 活动id，不传值表示校友交流，传值表示活动分享
	 * @param {File} [picture1] 1张图片 : picture1 一定要按照顺序
	 * @param {File} [picture2] 2张图片 : picture2, picture2 一定要按照顺序
	 * @param {File} [picture3] 3张图片 : picture1, picture2, picture3 一定要按照顺序
	 * @return {JSON}
	 */
	app.post('/api/issues/post', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors(21301));
		delete req.body['id'];
		Issue.forge(_.extend(req.body, { userid: user.id })).save()
			.then(function (issue) {
				var issueid = issue.get('id');
				if (req.files['picture1'])
					Picture.forge({ issueid: issueid })
						.save().then(function (picture) {
							picture.updatePicture('avatar', req.files['picture1']['path'])
								.then(function () {
									if (req.files['picture2'])
										Picture.forge({ issueid: issueid })
											.save().then(function (picture) {
												picture.updatePicture('avatar', req.files['picture2']['path'])
													.then(function () {
														if (req.files['picture3'])
															Picture.forge({ issueid: issueid })
																.save().then(function (picture) {
																	picture.updatePicture('avatar', req.files['picture3']['path'])
															})
												})
										})
							});
					});
				next({
					msg: 'Issue posted',
					id: issue.id
				});
			}).catch(next);
	});

	/**
	 * POST /api/issues/update
	 * @method 更新话题
	 * @param {Number} id 话题ID
	 * @param {String} [title] 标题
	 * @param {String} [body] 内容
	 * @return {JSON}
	 */
	app.post('/api/issues/update', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors(21301));
		var id = req.body['id'];
		delete req.body['id'];
		Issue.forge({ id: id }).fetch()
			.then(function (issue) {
				if (!issue) throw errors(20603);
				if (issue.get('userid') != user.id) {
					throw errors(20102);
				}
				return issue.set(req.body).save();
			}).then(function () {
				next({ msg: 'Issue updated' });
			}).catch(next);
	});

	/**
	 * POST /api/issues/delete
	 * @method 删除话题
	 * @param {Number} id 话题ID
	 * @return {JSON}
	 */
	app.post('/api/issues/delete', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors(21301));
		Issue.forge({ id: req.body['id'] }).fetch()
			.then(function (issue) {
				if (!issue) throw errors(20603);
				if (issue.get('userid') != user.id) {
					throw errors(20102);
				}
				return issue.destroy();
			}).then(function () {
				next({ msg: 'Issue deleted' });
			}).catch(next);
	});

	/**
	 * POST /api/issues/comments/post
	 * @method 评论话题
	 * @param {Number} issueid 话题ID
	 * @param {String} body 内容
	 * @return {JSON}
	 */
	app.post('/api/issues/comments/post', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors(21301));
		Issue.forge({ id: req.body['issueid'] }).fetch()
			.then(function (issue) {
				if (!issue) throw errors(20603);
				req.body['userid'] = user.id;
				return IssueComment.forge(req.body).save()
					.then(function (comment) {
						var author = issue.related('user');
						mail({
							to: author.related('profile').get('email'),
							subject: '您的话题被评论了',
							text: [
								'您发布的话题 <' + issue.get('title') + '>',
								'得到了 @' + user.related('profile').get('name') + ' 的评论!'
							].join('\n')
						});
						next({
							msg: 'Comment posted',
							id: comment.id
						});
					});
			}).catch(next);
	});

	/**
	 * POST /api/issues/comments/update
	 * @method 更新评论
	 * @param {Number} id 评论ID
	 * @param {String} [body] 内容
	 * @return {JSON}
	 */
	app.post('/api/issues/comments/update', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors(21301));
		var id = req.body['id'];
		delete req.body['id'];
		IssueComment.forge({ id: id }).fetch()
			.then(function (comment) {
				if (!comment) throw errors(20603);
				if (comment.get('userid') != user.id) {
					throw errors(20102);
				}
				return comment.set(req.body).save();
			}).then(function () {
				next({ msg: 'Comment updated' });
			}).catch(next);
	});

	/**
	 * POST /api/issues/comments/delete
	 * @method 删除评论
	 * @param {Number} id 评论ID
	 * @return {JSON}
	 */
	app.post('/api/issues/comments/delete', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors(21301));
		IssueComment.forge({ id: req.body['id'] }).fetch()
			.then(function (comment) {
				if (!comment) throw errors(20603);
				if (comment.get('userid') != user.id) {
					throw errors(20102);
				}
				return comment.destroy();
			}).then(function () {
				next({ msg: 'Comment deleted' });
			}).catch(next);
	});
};
