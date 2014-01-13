/**
 * @class 用户
 */
var _ = require('underscore'),
	User = require('../models/user'),
	errors = require('../lib/errors');

module.exports = function (app) {
	/**
	 * GET /api/users/find
	 * @method 会员列表
	 * @param {Number} [id]
	 * @param {String} [username]
	 * @param {String} [name]
	 * @param {Number} [isonline] 1在线，0不在线
	 * @param {String} [email]
	 * @param {String} [gender] “m”男，“f”女
	 * @return {Array}
	 * // GET /api/users/find?isonline=1&gender=f&limit=2&page=3  
	 * {  
		　　"users": [  
		　　　　{  
		　　　　　　"id": 14,  
		　　　　　　"username": "nemjoptaz",  
		　　　　　　“avatar”:”http://10.10.65.165:8080/avatar/14”,  
		　　　　　　“description”:”我是科技界大牛”,  
		　　　　　　"isonline": 1  
		　　　　},  
		　　　　{  
		　　　　　　"id": 20,  
		　　　　　　"username": "pa",  
		　　　　　　“avatar”:”http://10.10.65.165:8080/avatar/14”,  
		　　　　　　“description”:”我是科技界大牛”,  
		　　　　　　"isonline": 1  
		　　　　}  
		　　]  
		}
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
	 * @param {String} [nickname] 昵称
	 * @param {String} [name] 真名
	 * @param {String} [university] 学校
	 * @param {String} [major] 专业
	 * @return {Array}
	 * 返回格式与 /api/users/find 相同
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
	 * @param {Number} id
	 * @return {Array}
	 * // GET /api/users/view?id=88  
	 {  
	　　"user": {  
	　　　　"id": 88,  
	　　　　"username": "zodisukeg",  
	　　　　"regtime": 1357441421000,  
	　　　　"isonline": 1,  
	　　　　"profile": {  
	　　　　　　"email": "rofno@alube.net",  
	　　　　　　"nickname": "Brady Robertson",  
	　　　　　　"name": "Stephen Brady",  
	　　　　　　"gender": "m",  
	　　　　　　"age": 46,  
	　　　　　　"grade": 1986,  
	　　　　　　"university": "Sihijsa University",  
	　　　　　　"major": "Viwrun"  
	　　　　}  
	　　}  
	 }
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
	 * @param {String} profile.name 真名
	 * @param {String} profile.nickname 昵称
	 * @param {String} profile.email 邮箱
	 * @return {Array}
	 * // POST /api/users/reg  
		//   username, password, profile[email],  
		//   profile[nickname], profile[name] ...  
			{  
				"msg": "register success",  
				"id": 101  
			}  
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
	 * @return {Array} 
	 * // POST /api/users/login  
		//   username, password  
		 {  
		  "msg": "login success",  
		  "id": 101  
		}  
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
	 * @return {Array}
	 * // POST /api/users/logout  
		 {  
		  "msg": "logout success"  
		}  
	 */
	app.post('/api/users/logout', function (req, res, next) {
		User.forge({ id: req.session['userid'] })
			.logout()
			.then(function () {
				next({ msg: 'User logged out' });
			}).catch(next);
	});

	/**
	 * POST /api/users/password/reset
	 * @method 重置密码
	 * @param {String} password 旧密码
	 * @param {String} new-password 新密码
	 * @return {Array}
	 * { msg: 'Password reset' }
	 */
	app.post('/api/users/password/reset', function (req, res, next) {
		User.forge({ id: req.session['userid'] })
			.resetPassword(req.body)
			.then(function () {
				next({ msg: 'Password reset' });
			}).catch(next);
	});
	app.post('/api/users/profile/update', function (req, res, next) {
		User.forge({ id: req.session['userid'] })
			.updateProfile(req.body)
			.then(function () {
				next({ msg: 'Profile updated' });
			}).catch(next);
	});
	app.post('/api/users/avatar/update', function (req, res, next) {
		if (!req.files['avatar']) return next(errors[20007]);
		var file = req.files['avatar'],
			_3M = 3 * 1024 * 1024;
		if (file['type'] != 'image/jpeg') return next(errors[20005]);
		if (file['size'] > _3M) return next(errors[20006]);
		User.forge({ id: req.session['userid'] })
			.updateAvatar(file['path'])
			.then(function () {
				next({ msg: 'Avatar updated' });
			}).catch(next);
	});

	app.post('/api/users/friends/add', function (req, res, next) {
		var friendid = req.body['id'],
			remark = req.body['remark'];
		User.forge({ id: req.session['userid'] })
			.addFriend(friendid, remark)
			.then(function () {
				res.send({ msg: 'Friend added' });
			}).catch(next);
	});
	app.post('/api/users/friends/remove', function (req, res, next) {
		var friendid = req.body['id'];
		User.forge({ id: req.session['userid'] })
			.removeFriend(friendid)
			.then(function () {
				res.send({ msg: 'Friend removed' });
			}).catch(next);
	});
	app.post('/api/users/friends/remark', function (req, res, next) {
		var friendid = req.body['id'],
			remark = req.body['remark'];
		User.forge({ id: req.session['userid'] })
			.remarkFriend(friendid, remark)
			.then(function () {
				res.send({ msg: 'Friend remarked' });
			}).catch(next);
	});
};
