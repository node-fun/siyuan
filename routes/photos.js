/**
 * Created by fritz on 1/17/14.
 * @class 相片
 */
var _ = require('underscore'),
	Promise = require('bluebird'),
	Photo = require('../models/photo'),
	errors = require('../lib/errors');

module.exports = function (app) {
	/**
	 * GET /api/photos/find
	 * @method 相片列表
	 * @param {Number} [id] 相片ID
	 * @param {Number} [userid] 作者ID
	 * @param {String} [title] 标题
	 * @return {JSON}
	 */
	app.get('/api/photos/find', function (req, res, next) {
		Photo.find(req.query)
			.then(function (photos) {
				next({ photos: photos });
			}).catch(next);
	});

	/**
	 * POST /api/photos/post
	 * @method 发布相片
	 * @param {String} title 标题
	 * @param {String} body 内容
	 * @return {JSON}
	 * {
		  "msg": "photo posted",
		  "id": 106
		}
	 */
	app.post('/api/photos/post', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		delete req.body['id'];
		Photo.forge(_.extend(req.body, { userid: user.id })).save()
			.then(function (photo) {
				next({
					msg: 'Photo posted',
					id: photo.id
				});
			}).catch(next);
	});

	/**
	 * GET /api/photos/update
	 * @method 删除相片
	 * @param {Number} id 相片ID
	 * @param {String} title 标题
	 * @param {String} body 内容
	 * @return {JSON}
	 * { msg: 'Photo updated' }
	 */
	app.post('/api/photos/update', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		var id = req.body['id'];
		delete req.body['id'];
		Photo.forge({ id: id }).fetch()
			.then(function (photo) {
				if (!photo) return Promise.rejected(errors[20603]);
				if (photo.get('userid') != user.id) {
					return Promise.rejected(errors[20102]);
				}
				return photo.set(req.body).save();
			}).then(function () {
				next({ msg: 'Photo updated' });
			}).catch(next);
	});

	/**
	 * GET /api/photos/delete
	 * @method 删除相片
	 * @param {Number} id 相片ID
	 * @return {JSON}
	 * { msg: 'Photo deleted' }
	 */
	app.post('/api/photos/delete', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		Photo.forge({ id: req.body['id'] }).fetch()
			.then(function (photo) {
				if (!photo) return Promise.rejected(errors[20603]);
				if (photo.get('userid') != user.id) {
					return Promise.rejected(errors[20102]);
				}
				return photo.destroy();
			}).then(function () {
				next({ msg: 'Photo deleted' });
			}).catch(next);
	});
};
