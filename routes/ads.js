/**
 * Created by Cam on 14-1-8.
 * @class APP上方滚动广告
 */
var Ad = require('../models/ad'),
	errors = require('../lib/errors'),
	fs = require('fs'),
	Ads = Ad.Set;

module.exports = function (app) {

	/**
	 * get /api/ads/list
	 * @method 取得广告标题和图片
	 * @param {null}
	 * @return {JSON} {  
	 * 　　title: '',
	 * 　　picture: ''
	 * }
	 */
	app.get('/api/ads/list', function (req, res, next) {
		Ads.forge().query('where', 'isoutofdate', '=', 'false')
			.fetch({
				columns: ['id', 'title', 'picture']
			})
			.then(function (ads) {
				next(ads);
			}).catch(next);
	});

	/**
	 * get /api/ads/find
	 * @method 广告列表（全部）
	 * @param {null}
	 * @return {JSON}
	 * 含ad模型的所有字段
	 */
	app.get('/api/ads/find', function (req, res, next) {
		Ads.forge()
			.fetch()
			.then(function (ads) {
				next(ads);
			}).catch(next);
	});

	/**
	 * get /api/ads/view
	 * @method 广告详细内容
	 * @param {String} id
	 * @return {JSON}
	 * 含ad模型的所有字段
	 */
	app.get('/api/ads/view', function (req, res, next) {
		Ad.forge({id: req.query['id']})
			.fetch()
			.then(function (ad) {
				if(!ad) return next(errors(20603));
				return next(ad);
			}).catch(next);
	});

	/**
	 * post /api/ads/add
	 * @method 添加广告
	 * @param {String} title
	 * @param {String} content
	 * @param {String} picture
	 * @return {JSON}
	 * {msg: 'ad added'}
	 */
	app.post('/api/ads/add', function (req, res, next) {
		if (!req.session.adminid) {
			return next(errors(21301));
		}
		Ad.forge(req.body)
			.set({adminid: req.session.adminid})
			.save()
			.then(function () {
				next({msg: 'ad added'});
			}).catch(next);
	});

	/**
	 * post /api/ads/del
	 * @method 删除广告
	 * @param {String} id
	 * @return {JSON}
	 * {msg: 'ad deleted'}
	 */
	app.post('/api/ads/del', function (req, res, next) {
		if (!req.session.adminid) {
			return next(errors(21301));
		}
		Ad.forge({id: req.body['id']})
			.fetch()
			.then(function (ad) {
				ad.destroy().then(function () {
					next({msg: 'ad deleted'});
				});
			}).catch(next);
	});

	/**
	 * get /api/ads/imgs
	 * @method 图片列表
	 * @param {Null}
	 * @return {JSON}
	 *
	 */
	app.get('/api/ads/imgs', function (req, res, next) {
		if (!req.session.adminid) {
			return next(errors(21301));
		}
		fs.readdir('./static/ad/img', function (err, files) {
			if (err) {
				return next(err);
			}
			return next(files);
		});
	});

	/**
	 * post /api/ads/imgs/upload
	 * @method 上传广告图片
	 * @param {File} picture
	 * @return {HTML}
	 * 上传成功，返回上一页
	 */
	app.post('/api/ads/imgs/upload', function (req, res, next) {
		if (!req.session.adminid) {
			return next(errors(21301));
		}
		var file = req.files['picture'],
			newPath = './static/ad/img/' + new Date().getTime();
		if (!file) return next(errors(20007));
		fs.readFile(file['path'], function (err, data) {
			if (err) return next(errors(30000));
			fs.writeFile(newPath, data, function (err) {
				if (err) return next(errors(30001));
				res.writeHead(200, {'Content-Type': 'text/html', 'charset': 'utf-8'});
				res.end('上传成功！<script>history.back();</script>');
			});
		});
	});

	/**
	 * post /api/ads/imgs/del
	 * @method 删除广告图片
	 * @param {Number} name
	 * @return {JSON}
	 * {msg: 'delete succeeded！'}
	 */
	app.get('/api/ads/imgs/del', function (req, res, next) {
		if (!req.session.adminid) {
			return next(errors(21301));
		}
		if (!req.body['name']) return next(errors(10008));
		var file = './static/ad/img/' + req.body['name'];
		fs.unlink(file, function (err) {
			if (err) return next(err);
			return next({msg: 'delete succeeded！'});
		});
	});
};
