/**
 * Created by fritz on 1/20/14.
 * @class 收藏
 */
var _ = require('underscore'),
	Promise = require('bluebird'),
	Starship = require('../models/starship'),
	StarshipSet = Starship.Set,
	errors = require('../lib/errors'),
	Entity = require('../lib/entity');

module.exports = function (app) {
	/**
	 * GET /api/starship/list
	 * @method 收藏列表
	 * @param {Number} [id] 收藏ID
	 * @param {Number} [userid] 用户ID
	 * @param {Number} [itemtype] 类别ID
	 * @param {Number} [itemid] 资源ID
	 * @return {JSON}
	 */
	app.get('/api/starship/list', function (req, res, next) {
		if (!req.admin) return next(errors[21301]);
		StarshipSet.list(req.query, StarshipSet.lister)
			.then(function (starshipSet) {
				next({ starring: starshipSet });
			}).catch(next);
	});

	/**
	 * GET /api/starship/my
	 * @method 自己的收藏列表
	 * @param {Number} [id] 收藏ID
	 * @param {Number} [userid] 用户ID
	 * @param {Number} [itemtype] 类别ID
	 * @param {Number} [itemid] 资源ID
	 * @return {JSON}
	 */
	app.get('/api/starship/my', function (req, res, next) {
		if (!req.user) return next(errors[21301]);
		return StarshipSet.list(req.query, function (qb) {
			qb.where('userid', req.user.id);
		}, StarshipSet.lister)
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
		// type limitation in starship
		if (!~Starship.typesAllowed.indexOf(1 * req.body['itemtype'])) {
			return next(errors[20701]);
		}
		Entity
			.forge(req.body['itemtype'], {
				id: req.body['itemid']
			}).then(function (model) {
				return model.fetch();
			}).then(function (entity) {
				if (!entity) return Promise.reject(errors[20605]);
				return Starship.forge(
						_.pick(req.body, ['userid', 'itemtype', 'itemid', 'remark'])
					).save()
					.catch(function (err) {
						if (/^ER_DUP_ENTRY/.test(err.message)) {
							return Promise.reject(errors[20506]);
						}
						return Promise.reject(err);
					});
			}).then(function () {
				next({ msg: 'Entity starred' });
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
				if (!starship) return Promise.reject(errors[20603]);
				if (starship.get('userid') != user.id) {
					return Promise.reject(errors[20102]);
				}
				return starship.destroy();
			}).then(function () {
				next({ msg: 'Entity unstarred' });
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
				if (!starship) return Promise.reject(errors[20603]);
				if (starship.get('userid') != user.id) {
					return Promise.reject(errors[20102]);
				}
				return starship.set(
					_.pick(req.body, 'remark')
				).save();
			}).then(function () {
				next({ msg: 'Entity remarked' });
			}).catch(next);
	});
};
