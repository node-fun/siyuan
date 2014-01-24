/**
 * Created by Cam on 14-1-8.
 * @class APP上方滚动广告
 */
var Ad = require('../models/ad'),
	errors = require('../lib/errors'),
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
	app.get('/api/ads/list', function (req, res, next){
		Ads.forge().query('where', 'isoutofdate', '=', 'false')
			.fetch({
				columns: ['title','content']
			})
			.then(function(ads){
				next(ads);
			});
	});
	
	/**
	 * get /api/ads/find
	 * @method 广告列表（全）
	 * @param {null}
	 * @return {JSON} 
	 * 含ad模型的所有字段
	 */
	app.get('/api/ads/find', function (req, res, next){
		Ads.forge()
			.fetch().then(
				function(ads){
					next(ads);
				}
			);
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
	app.post('/api/ads/add', function(req, res, next){
		if(!req.session.adminid){
			next(errors[21301]);
		}
		Ad.forge(req.body)
			.set({adminid: req.session.adminid})
			.save()
			.then(function(){
				next({msg: 'ad added'});
			});
	});
};
