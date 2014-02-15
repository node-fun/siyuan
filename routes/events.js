/**
 * Created by fritz on 1/21/14.
 * @class 动态
 */
var Event = require('../models/event'),
	Events = Event.Set;

module.exports = function (app) {
	/**
	 * GET /api/events/list
	 * @method 动态列表
	 * @param {Number} [id] 动态ID
	 * @param {Number} [userid] 用户ID
	 * @param {Number} [groupid] 圈子ID
	 * @param {Number} [itemtype] 类别ID
	 * @param {Number} [itemid] 资源ID
	 * @param {Number} [search] 是否采用搜索
	 * @return {JSON}
	 */
	app.get('/api/events/list', function (req, res, next) {
		Events.list(req.query, Events.lister)
			.then(function (events) {
				next({ events: events });
			}).catch(next);
	});
};
