/**
 * Created by Cam on 14-2-16.
 * @class 反馈
 */
var Feedback = require('../models/feedback'),
	Feedbacks = Feedback.Set,
	_ = require('underscore'),
	errors = require('../lib/errors');

module.exports = function (app) {
	/**
	 * GET /api/feedbacks/list
	 * @method 反馈列表
	 * @param {String} page/limit/order
	 */
	app.get('/api/feedbacks/list', function (req, res, next) {
		Feedbacks.forge().fetch({ req: req })
			.then(function (feedbacks) {
				next({ feedbacks: feedbacks});
			}).catch(next);
	});

	/**
	 * POST /api/feedbacks/post
	 * @method 发送反馈
	 * @param {String} [title] 标题
	 * @param {String} body 内容
	 * @param {String} type 反馈类型（advice、bug等，后台不限制，由客户端定义）
	 * @param {String} versioncode 客户端版本号
	 * @param {String} [device] 设备型号（手机型号）
	 */
	app.post('/api/feedbacks/post', function (req, res, next) {
		if (!req.user) return next(errors(21301));
		if (!req.body['body'] || !req.body['type'] || !req.body['versioncode'])
			return next(errors(10008));
		Feedback.forge(_.extend(req.body, { userid: req.user.id }))
			.save()
			.then(function (feedback) {
				next({
					msg: 'Feedback posted',
					id: feedback.id
				});
			}).catch(next);
	});
};
