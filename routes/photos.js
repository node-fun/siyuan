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
	 * @param {Number} [userid] 用户ID
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
	 * @param {String} description 描述
	 * @param {File} image 图片文件
	 * @return {JSON}
	 * {
		  "msg": "photo posted",
		  "id": 106
		}
	 */
	app.post('/api/photos/post', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		if (!req.files['image']) return next(errors[20007]);
		var file = req.files['image'],
			_4M = 4 * 1024 * 1024;
		if (file['type'] != 'image/jpeg') return next(errors[20005]);
		if (file['size'] > _4M) return next(errors[20006]);
		delete req.body['id'];
		req.body['userid'] = user.id;
		var photo = Photo.forge(req.body);
		photo.data('image', file['path']).save()
			.then(function () {
				next({
					msg: 'Photo posted',
					id: photo.id
				});
			}).catch(next);
	});

	/**
	 * POST /api/photos/update
	 * @method 更新相片
	 * @param {Number} id 相片ID
	 * @param {String} description 描述
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
	 * POST /api/photos/delete
	 * @method 删除相片
	 * @param {Number} id 相片ID
	 * @return {JSON}
	 * { msg: 'Photo deleted' }
	 */
	app.post('/api/photos/delete', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		var photo = Photo.forge({ id: req.body['id'] });
		photo.fetch()
			.then(function () {
				if (!photo) return Promise.rejected(errors[20603]);
				if (photo.get('userid') != user.id) {
					return Promise.rejected(errors[20102]);
				}
			}).then(function () {
				return photo.destroy();
			}).then(function () {
				next({ msg: 'Photo deleted' });
			}).catch(next);
	});
};
