/**
 * @class 用户
 */
var _ = require('underscore'),
	User = require('../models/user'),
	errors = require('../lib/errors'),
	config = require('../config'),
	imageLimit = config.imageLimit;

module.exports = function (app) {
	/**
	 * GET /api/users/find
	 * @method 会员列表
	 * @param {Number} [id] 用户ID
	 * @param {String} [username] 用户名
	 * @param {Number} [isonline] 是否在线 - `1`在线, `0`不在线
	 * @param {String} [profile.email] 邮箱
	 * @param {String} [profile.name] 姓名
	 * @param {String} [profile.gender] 性别 - `m`男, `f`女
	 * @param {String} [profile.summary] 个性签名
	 * @return {JSON}
	 * <pre>
{
	users: [
		{
			"id": 1,
			"username": "la_810",
			"regtime": 1384308065000,
			"isonline": 0,
			"numFollowing": 1,
			"numFollowers": 1,
			"numIssues": 2,
			"lastIssue": {
				"id": 67,
				"title": "Nesemohoz weke sojluka ciwiul dufa huki pik arokin ar agegopu du",
				"body": "Adorocoz ijo nodijoc dabiute latzi oludum uv jo uldikpoj uvma wizdojpig ip gin fono fehceb tu. Vapgokis ani kusedira ubewehig dazusgi zu sakuthud ze fak sije zur do donajlu soujo fo. Bo ec mi siodi leeb avcusu suenit riwpize azakre linuv ifeevbud tenfeh kijreh decticup at. Anaweh guhoka vuhdib ligwapwe pevinki kiggeika ne kopmevo hifminre tezeg agsulo pif iseduhdel lieduji cebrop boshote bueteonu. Kiutufi dadpo najgijvak marsiive ra ajowiedi ed ataguc kag onivo fomihu wevih jewu wa pa da siunki.",
				"posttime": 1387663599000
			},
			"numPhotos": 1,
			"profile": {
				"email": "in@okoducrag.co.uk",
				"name": "Emmanuel Salazar",
				"gender": "f",
				"age": 23,
				"grade": 2009,
				"university": "Zukubhi University",
				"major": "Le",
	 			"summary": "Olaruwit pagko jut jouzicev vetab ipuwatbec faknok dini helasawe hu ospu lom mopucco."
			},
			"avatar": "/avatars/1.jpg"
		},
		...
	]
}
	 * </pre>
	 */
	app.get('/api/users/find', function (req, res, next) {
		User.find(req.query)
			.then(function (users) {
				next({ users: users });
			}).catch(next);
	});

	/**
	 * GET /api/users/search
	 * @method 模糊搜索用户
	 * @param {String} [username] 用户名
	 * @param {Number} [isonline] 是否在线
	 * @param {String} [profile.name] 姓名
	 * @param {String} [profile.gender] 性别
	 * @param {String} [profile.university] 学校
	 * @param {String} [profile.major] 专业
	 * @param {String} [profile.summary] 个性签名
	 * @return {JSON}
	 */
	app.get('/api/users/search', function (req, res, next) {
		User.search(req.query)
			.then(function (users) {
				next({ users: users });
			}).catch(next);
	});

	/**
	 * Get /api/users/view
	 * @method 会员详细资料
	 * @param {Number} id 用户ID
	 * @return {JSON}
	 */
	app.get('/api/users/view', function (req, res, next) {
		User.view(req.query)
			.then(function (user) {
				next({ user: user });
			}).catch(next);
	});

	/**
	 * POST /api/users/register
	 * @method 注册
	 * @param {String} username 用户名
	 * @param {String} password 密码
	 * @param {String} [profile.email] 邮箱
	 * @param {String} [profile.name] 姓名
	 * @param {String} [profile.gender] 性别
	 * @param {Number} [profile.age] 年龄
	 * @param {Number} [profile.grade] 入学级数
	 * @param {String} [profile.university] 学校
	 * @param {String} [profile.major] 专业
	 * @param {String} [profile.summary] 个性签名
	 * @return {JSON}
	 * <pre>
//   username, password, profile[email], profile[name] ...
{
	"msg": "User registered",
	"id": 36
}
	 * </pre>
	 */
	app.post('/api/users/register', function (req, res, next) {
		User.forge(req.body).register()
			.then(function (user) {
				next({
					msg: 'User registered',
					id: user.id
				});
			}).catch(next);
	});

	/**
	 * POST /api/users/login
	 * @method 登录
	 * @param {String} username
	 * @param {String} password
	 * @return {JSON}
	 */
	app.post('/api/users/login', function (req, res, next) {
		User.forge(req.body).login()
			.then(function (user) {
				next({
					msg: 'User logged in',
					id: req.session['userid'] = user.id
				});
			}).catch(next);
	});

	/**
	 * POST /api/users/logout
	 * @method 退出
	 * @return {JSON}
	 */
	app.post('/api/users/logout', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		user.logout()
			.then(function () {
				next({ msg: 'User logged out' });
			}).catch(next);
	});

	/**
	 * POST /api/users/password/reset
	 * @method 重置密码
	 * @param {String} password 原密码
	 * @param {String} new-password 新密码
	 * @return {JSON}
	 */
	app.post('/api/users/password/reset', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		user.resetPassword(req.body)
			.then(function () {
				next({ msg: 'Password reset' });
			}).catch(next);
	});

	/**
	 * POST /api/users/profile/update
	 * @method 更新个人档案
	 * @param {String} [email] 邮箱
	 * @param {String} [name] 姓名
	 * @param {String} [gender] 性别
	 * @param {Number} [age] 年龄
	 * @param {Number} [grade] 入学级数
	 * @param {String} [university] 学校
	 * @param {String} [major] 专业
	 * @param {String} [summary] 个性签名
	 * @return {JSON}
	 */
	app.post('/api/users/profile/update', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		user.updateProfile(req.body)
			.then(function () {
				next({ msg: 'Profile updated' });
			}).catch(next);
	});

	/**
	 * POST /api/users/avatar/update
	 * @method 更新头像
	 * @param {File} avatar
	 * @return {JSON}
	 */
	app.post('/api/users/avatar/update', function (req, res, next) {
		var user = req.user,
			file = req.files['avatar'];
		if (!user) return next(errors[21301]);
		if (!file) return next(errors[20007]);
		if (file['type'] != 'image/jpeg') return next(errors[20005]);
		if (file['size'] > imageLimit) return next(errors[20006]);
		user.updateAvatar(file['path'])
			.then(function () {
				next({ msg: 'Avatar updated' });
			}).catch(next);
	});
};
