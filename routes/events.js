/**
 * Created by fritz on 1/21/14.
 * @class 动态
 */
var _ = require('underscore'),
	errors = require('../lib/errors'),
	Event = require('../models/event'),
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
	 * @param {String} [message] 动态描述(仅限搜索)
	 * @return {JSON}
	 */
	app.get('/api/events/list', function (req, res, next) {
		Events.forge().fetch({ req: req })
			.then(function (events) {
				next({ events: events });
			}).catch(next);
	});

	/**
	 * GET /api/events/my
	 * @method 自己的动态列表
	 * @param {Number} [groupid] 圈子ID
	 * @param {Number} [itemtype] 类别ID
	 * @param {Number} [itemid] 资源ID
	 * @param {String} [message] 动态描述(仅限搜索)
	 * @return {JSON}
	 */
	app.get('/api/events/my', function (req, res, next) {
		if (!req.user) return next(errors[21301]);
		req.query = _.omit(req.query, ['id']);
		req.query['userid'] = req.user.id;
		Events.forge().fetch({ req: req })
			.then(function (events) {
				next({ events: events });
			}).catch(next);
	});

	/**
	 * GET /api/events/following
	 * @method 所关注的用户相关的动态列表
	 * @param {Number} [groupid] 圈子ID
	 * @param {Number} [itemtype] 类别ID
	 * @param {Number} [itemid] 资源ID
	 * @param {String} [message] 动态描述(仅限搜索)
	 * @return {JSON}
	 */
	app.get('/api/events/following', function (req, res, next) {
		if (!req.user) return next(errors[21301]);
		req.query = _.omit(req.query, ['id']);
		req.user.following().fetch()
			.then(function (following) {
				req.query['userid'] = following.map(function (followship) {
					return followship.get('followid');
				});
				return Events.forge().fetch({ req: req });
			}).then(function (events) {
				next({ events: events });
			}).catch(next);
	});
};
