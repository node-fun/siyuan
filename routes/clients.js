/**
 * Created by Cam on 14-2-6.
 * @class 客户端版本
 */
var ClientVersion = require('../models/clientVersion'),
	errors = require('../lib/errors'),
	fs = require('fs'),
	config = require('../config'),
	ClientVersions = ClientVersion.Set;

module.exports = function (app) {

	/**
	 * get /api/clients/find
	 * @method 版本列表
	 * @param {null}
	 * @return {JSON}
	 */
	app.get('/api/clients/find', function (req, res, next) {
		ClientVersions.forge()
			.query(function (qb) {
				qb.orderBy('id', 'desc');
			})
			.fetch().then(
			function (clients) {
				next({clients: clients});
			}
		);
	});

	/**
	 * get /api/clients/latest
	 * @method 最新版本信息
	 * @param {null}
	 * @return {JSON}
	 */
	app.get('/api/clients/latest', function (req, res, next) {
		ClientVersion.forge()
			.query(function (qb) {
				qb.orderBy('id', 'desc');
				qb.limit(1);
			})
			.fetch().then(
			function (client) {
				next(client);
			}
		);
	});

	/**
	 * get /api/clients/download
	 * @method 客户端下载（最新版本）
	 * @param {null}
	 * @return {JSON}
	 */
	app.get('/api/clients/download', function (req, res, next) {
		ClientVersion.forge()
			.query(function (qb) {
				qb.orderBy('id', 'desc');
				qb.limit(1);
			})
			.fetch().then(
			function (client) {
				var path = config.contentDir + '/clients/siyuan' + client.get('versioncode') + '.apk';
				res.download(path, 'siyuan.apk');
			}
		);
	});

	/**
	 * post /api/clients/add
	 * @method 添加新版本
	 * @param {String} versioncode
	 * @param {String} versionname
	 * @param {String} description
	 * @param {String} comment
	 * @param {File} file
	 * @return {JSON}
	 * {msg: 'client added'}
	 */
	app.post('/api/clients/add', function (req, res, next) {
		if (!req.session.adminid) {
			return next(errors[21301]);
		}

		var file = req.files['file'],
			newPath = config.contentDir + '/clients/siyuan' + req.body['versioncode'] + '.apk';
		if (!file) return next(errors[20007]);
		fs.readFile(file['path'], function (err, data) {
			if (err) return next(errors[30000]);
			fs.writeFile(newPath, data, function (err) {
				if (err) return next(errors[30001]);
				ClientVersion.forge(req.body)
					.save()
					.then(function () {
						next({msg: 'client added'});
					});
			});
		});
	});

};
