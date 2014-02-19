/**
 * @class 用户
 */
var _ = require('underscore'),
	User = require('../models/user'),
	Users = User.Set,
	errors = require('../lib/errors'),
	mail = require('../lib/mail'),
	config = require('../config'),
	imageLimit = config.imageLimit;

module.exports = function (app) {
	/**
	 * GET /api/users/list
	 * @method 会员列表
	 * @param {Number} [id] 用户ID
	 * @param {String} [username] 用户名
	 * @param {Number} [isonline] 是否在线 - `1`在线, `0`不在线
	 * @param {String} [profile.name] 姓名
	 * @param {String} [profile.gender] 性别 - `m`男, `f`女
	 * @param {String} [profile.university] 院校 (仅限搜索)
	 * @param {String} [profile.major] 专业 (仅限搜索)
	 * @param {String} [profile.summary] 个性签名 (仅限搜索)
	 * @param {String} [profile.tag] 标签 (仅限搜索)
	 * @return {JSON}
	 * <pre>
	 {
		users: [
			{
				"id": 1,
				"username": "ko_334",
				"regtime": 1373071542000,
				"isonline": 0,
				"avatar": "/avatars/1.jpg",
				"cover": null,
				"profile": {
					 "email": "he@gec.net",
					 "name": "Nicolas Bailey",
					 "gender": "f",
					 "age": 45,
					 "grade": 1988,
					 "university": "Rizuuh University",
					 "major": "Asecoeb",
					 "summary": "Lubudzot ujumipji bu elahumi ze puezawuh acu bi ajbez pirwivu movatra ulazujtob bapbape."
				 },
				 "isfollowed": 1,
	 		},
	 ...
	 ]
	 }
	 * </pre>
	 */
	app.get('/api/users/list', function (req, res, next) {
		Users.forge().fetch({ req: req })
			.then(function (users) {
				next({ users: users });
			}).catch(next);
	});

	/**
	 * GET /api/users/view
	 * @method 用户详情
	 * @param {Number} [id] 用户ID
	 * @return {JSON}
	 * <pre>
	 {
	  "user": {
		"id": 1,
		"username": "test",
		"regtime": 1360639970000,
		"isonline": 1,
		"avatar": "/avatars/1.jpg?t=1392728340875",
		"cover": "/covers/1.jpg?t=1392728340928",
		"profile": {
			 "email": "jizrehce@heowo.edu",
			 "name": "Ana Hunter",
			 "gender": "m",
			 "age": 45,
			 "grade": 1987,
			 "university": "Rurijuf University",
			 "major": "Agakalot",
			 "summary": "Zul ute juhjuwot bec wuwu bojnemob uszejow memolu fubipi omodicguv nisitucec heri.",
			 "tag": "ma,hajo,ze"
		 },
		 "isfollowed": 0,
		 "numFollowing": 4,
		 "numFollowers": 6,
		 "numIssues": 1,
		 "numPhotos": 2,
		 "numStarring": 3,
		 "numEvents": 2
		}
	 }
	 * </pre>
	 */
	app.get('/api/users/view', function (req, res, next) {
		Users.forge().fetch({ req: req, view: true })
			.then(function (user) {
				next({ user: user });
			}).catch(next);
	});

	/**
	 * GET /api/users/i
	 * @method 自己的用户详情
	 * @return {JSON}
	 */
	app.get('/api/users/i', function (req, res, next) {
		if (!req.user) return next(errors[21301]);
		req.query = _.omit(req.query, ['id']);
		req.query['id'] = req.user.id;
		Users.forge().fetch({ req: req, view: true })
			.then(function (user) {
				next({ user: user });
			}).catch(next);
	});

	/**
	 * POST /api/users/register
	 * @method 注册
	 * @param {String} username 用户名
	 * @param {String} password 密码
	 * @param {String} profile.email 邮箱
	 * @param {String} profile.name 姓名
	 * @param {String} [profile.gender] 性别
	 * @param {Number} [profile.age] 年龄
	 * @param {Number} [profile.grade] 入学级数
	 * @param {String} [profile.university] 学校
	 * @param {String} [profile.major] 专业
	 * @param {String} [profile.summary] 个性签名
	 * @param {String} [profile.tag] 标签
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
				var profile = user.related('profile');
				mail({
					to: profile.get('email'),
					subject: '思源群欢迎您的加入',
					html: [
						'您好 ' + profile.get('name') + ',',
						'您已成功注册思源群!',
						'用户名: ' + user.get('username'),
						'-------',
						'详情: <a href="http://61.174.8.62/">http://61.174.8.62/</a>'
					].join('<br>')
				});
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
	 * @param {String} [tag] 标签
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
		user.updateAsset('avatar', file['path'])
			.then(function () {
				next({ msg: 'Avatar updated' });
			}).catch(next);
	});

	/**
	 * POST /api/users/cover/update
	 * @method 更新封面
	 * @param {File} cover
	 * @return {JSON}
	 */
	app.post('/api/users/cover/update', function (req, res, next) {
		var user = req.user,
			file = req.files['cover'];
		if (!user) return next(errors[21301]);
		if (!file) return next(errors[20007]);
		if (file['type'] != 'image/jpeg') return next(errors[20005]);
		if (file['size'] > imageLimit) return next(errors[20006]);
		user.updateAsset('cover', file['path'])
			.then(function () {
				next({ msg: 'Cover updated' });
			}).catch(next);
	});
};
