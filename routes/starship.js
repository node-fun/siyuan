/**
 * Created by fritz on 1/20/14.
 * @class 收藏
 */
var _ = require('underscore'),
	Starship = require('../models/starship'),
	Starships = Starship.Set,
	config = require('../config'),
	errors = require('../lib/errors'),
	Entity = require('../lib/entity');

module.exports = function (app) {
	/**
	 * GET /api/starship/my
	 * @method 自己的收藏列表
	 * @param {Number} [itemtype] 类别ID
	 * @param {Number} [itemid] 资源ID
	 * @return {JSON}
	 */
	app.get('/api/starship/my', function (req, res, next) {
		if (!req.user) return next(errors(21301));
		req.query = _.omit(req.query, ['id']);
		req.query['userid'] = req.user.id;
		Starships.forge().fetch({ req: req })
			.then(function (starring) {
				next({ starring: starring });
			}).catch(next);
	});

	/**
	 * POST /api/starship/star
	 * @method 收藏资源
	 * @param {Number} itemtype 实体类别
	 * @param {Number} itemid 实体ID
	 * @param {Number} [remark] 备注
	 * @return {JSON}
	 */
	app.post('/api/starship/star', function (req, res, next) {
		if (!req.user) return next(errors(21301));
		req.body['userid'] = req.user.id;
		console.log(req.body['userid']);
		// type limitation in starship
		if (!~Starship.typesAllowed.map(function (name) {
			return config.entities.indexOf(name) + 1;
		}).indexOf(+req.body['itemtype'])) {
			return next(errors(20701));
		}
		Entity
			.forge(req.body['itemtype'], {
				id: req.body['itemid']
			}).then(function (model) {
				return model.fetch();
			}).then(function (entity) {
				if (!entity) throw errors(20605);
				return Starship.forge(
						_.pick(req.body, ['userid', 'itemtype', 'itemid', 'remark'])
					).save()
					.catch(function (err) {
						if (/^ER_DUP_ENTRY/.test(err.message)) {
							throw errors(20506);
						}
						throw err;
					});
			}).then(function () {
				next({ msg: 'Entity starred' });
			}).catch(next);
	});

	/**
	 * POST /api/starship/unstar
	 * @method 取消收藏
	 * @param {Number} [id] 收藏ID
	 * @param {Number} [itemtype] 实体类别
	 * @param {Number} [itemid] 实体ID
	 * @return {JSON}
	 */
	app.post('/api/starship/unstar', function (req, res, next) {
		if (!req.user) return next(errors(21301));
		Starship.forge(
				_.pick(req.body, ['id', 'itemtype', 'itemid'])
			).fetch()
			.then(function (starship) {
				if (!starship) throw errors(20603);
				if (starship.get('userid') != req.user.id) {
					console.log('userid1:' + starship.get('userid'));
					console.log('userid2:' + req.user.id);
					throw errors(20102);
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
		if (!req.user) return next(errors(21301));
		Starship.forge(
				_.pick(req.body, 'id')
			).fetch()
			.then(function (starship) {
				if (!starship) throw errors(20603);
				if (starship.get('userid') != req.user.id) {
					throw errors(20102);
				}
				return starship.set(
					_.pick(req.body, 'remark')
				).save();
			}).then(function () {
				next({ msg: 'Entity remarked' });
			}).catch(next);
	});
};
