/**
 * Created by fritz on 1/21/14.
 * @class 动态
 */
var Event = require('../models/event'),
	Events = Event.Set;

module.exports = function (app) {
	/**
	 * GET /api/event/find
	 * @method 动态列表
	 * @param {Number} [id] 动态ID
	 * @param {Number} [userid] 用户ID
	 * @param {Number} [groupid] 圈子ID
	 * @param {Number} [itemtype] 类别ID - `1`用户, `2`话题, `3`活动, `4`商务合作
	 * @param {Number} [itemid] 资源ID
	 * @return {JSON}
	 */
	app.get('/api/events/find', function (req, res, next) {
		Events.list(req.query, Events.finder)
			.then(function (events) {
				next({ events: events });
			}).catch(next);
	});

	/**
	 * GET /api/event/search
	 * @method 动态搜索
	 * @param {Number} [userid] 用户ID
	 * @param {Number} [groupid] 圈子ID
	 * @param {Number} [itemtype] 类别ID - `1`用户, `2`话题, `3`活动, `4`商务合作
	 * @param {Number} [itemid] 资源ID
	 * @param {String} [message] 动态描述
	 * @return {JSON}
	 */
	app.get('/api/events/search', function (req, res, next) {
		Events.list(req.query, Events.searcher)
			.then(function (events) {
				next({ events: events });
			}).catch(next);
	});
};
