/**
 * Created by fritz on 1/10/14.
 * @class api通用
 */
var errors = require('../lib/errors'),
	fs = require('fs');

module.exports = function (app) {
	require('./users')(app);
	require('./followship')(app);
	require('./admin')(app);
	require('./groups')(app);
	require('./activities')(app);
	require('./issues')(app);
	require('./photos')(app);
	require('./cooperations')(app);
	require('./starship')(app);
	require('./events')(app);
	require('./ads')(app);
	require('./clients')(app);
	require('./feedbacks')(app);
	require('./messages')(app);

	/**
	 * GET /api/
	 * @method api通用
	 * @param {Number} [limit] 每页记录数上限 - 默认`10`
	 * @param {Number} [offset] 起点偏移量 - 默认`0`
	 * @param {Number} [page] 页数 - 当`offset`指定时无效, 默认`1`
	 * @param {Number} [fuzzy] 是否采用模糊搜索 - `0`否 `1`是, 默认`0`
	 * @return {JSON}
	 */
	app.use('/api', function (data, req, res, next) {
		if (data instanceof Error) return next(data);
		res.send(data);
	});
	app.use('/api', function (err, req, res, next) {
		if (!err['code']) {
			console.error(err.stack ? err.stack : err);
			err = errors[10001];
		}
		res.sendErr(err);
	});
	app.use('/api', function (req, res) {
		res.sendErr(errors[10020]);
	});
	app.use('/admin', function (req, res, next) {
		if (!req.session.adminid) {
			res.sendfile('./static/admin/login.html');
		} else {
			next();
		}
	});
};
