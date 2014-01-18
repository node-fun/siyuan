/**
 * @class 关注
 */
var _ = require('underscore'),
	Followship = require('../models/followship'),
	errors = require('../lib/errors');

module.exports = function (app) {
	/**
	 * POST /api/followship/follow
	 * @method 加好友
	 * @param {Number} followid 用户ID
	 * @param {String} remark 备注名
	 * @return {JSON}
	 */
	app.post('/api/followship/follow', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		req.body['userid'] = user.id;
		Followship.follow(req.body)
			.then(function () {
				res.send({ msg: 'Followee followed' });
			}).catch(next);
	});

	/**
	 * POST /api/followship/unfollow
	 * @method 删除好友
	 * @param {Number} followid 用户ID
	 * @return {JSON}
	 */
	app.post('/api/followship/unfollow', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		req.body['userid'] = user.id;
		Followship.unfollow(req.body)
			.then(function () {
				res.send({ msg: 'Followee unfollowed' });
			}).catch(next);
	});

	/**
	 * POST /api/followship/remark
	 * @method 备注好友
	 * @param {Number} followid 用户ID
	 * @param {String} remark 备注名
	 * @return {JSON}
	 */
	app.post('/api/followship/remark', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		req.body['userid'] = user.id;
		Followship.remark(req.body)
			.then(function () {
				res.send({ msg: 'Followee remarked' });
			}).catch(next);
	});
};
