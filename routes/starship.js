/**
 * Created by fritz on 1/20/14.
 * @class 收藏
 */
var _ = require('underscore'),
	Promise = require('bluebird'),
	Starship = require('../models/starship'),
	errors = require('../lib/errors'),
	Resource = require('../lib/resource');

module.exports = function (app) {
	/**
	 * GET /api/starship/find
	 * @method 收藏列表
	 * @param {Number} [id] 收藏ID
	 * @param {Number} [userid] 用户ID
	 * @param {Number} [itemtype] 类别ID - `1`用户, `2`话题, `3`活动, `4`商务合作
	 * @param {Number} [itemid] 资源ID
	 * @return {JSON}
	 */
	app.get('/api/starship/find', function (req, res, next) {
		Starship.find(req.query)
			.then(function (starshipSet) {
				next({ starring: starshipSet });
			}).catch(next);
	});

	/**
	 * POST /api/starship/star
	 * @method 收藏资源
	 * @param {Number} itemtype 类别ID
	 * @param {Number} itemid 资源ID
	 * @param {Number} [remark] 备注
	 * @return {JSON}
	 */
	app.post('/api/starship/star', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		req.body['userid'] = user.id;
		Resource.forge(
				_.pick(req.body, ['itemtype', 'itemid'])
			).fetch()
			.then(function (resource) {
				if (!resource) return Promise.rejected(errors[20605]);
				return Starship.forge(
						_.pick(req.body, ['userid', 'itemtype', 'itemid', 'remark'])
					).save()
					.catch(function () {
						return Promise.rejected(errors[20506]);
					});
			}).then(function () {
				next({ msg: 'Resource starred' });
			}).catch(next);
	});

	/**
	 * POST /api/starship/unstar
	 * @method 取消收藏
	 * @param {Number} id 收藏ID
	 * @return {JSON}
	 */
	app.post('/api/starship/unstar', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		Starship.forge(
				_.pick(req.body, 'id')
			).fetch()
			.then(function (starship) {
				if (!starship) return Promise.rejected(errors[20603]);
				if (starship.get('userid') != user.id) {
					return Promise.rejected(errors[20102]);
				}
				return starship.destroy();
			}).then(function () {
				next({ msg: 'Resource unstarred' });
			}).catch(next);
	});

	/**
	 * POST /api/starship/remark
	 * @method 修改备注
	 * @param {Number} id 收藏ID
	 * @param {String} [remark] 备注
	 * @return {JSON}
	 */
	app.post('/api/starship/remark', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		Starship.forge(
				_.pick(req.body, 'id')
			).fetch()
			.then(function (starship) {
				if (!starship) return Promise.rejected(errors[20603]);
				if (starship.get('userid') != user.id) {
					return Promise.rejected(errors[20102]);
				}
				return starship.set(
					_.pick(req.body, 'remark')
				).save();
			}).then(function () {
				next({ msg: 'Resource remarked' });
			}).catch(next);
	});
};
