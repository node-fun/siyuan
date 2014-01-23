var _ = require('underscore'),
	Promise = require('bluebird'),
	Cooperation = require('../models/cooperation'),
	UserCooperations = require('../models/user-cooperation'),
	errors = require('../lib/errors');

module.exports = function (app) {
	/**
	 * GET /api/cooperations/find
	 * @method 合作列表
	 * @param {Number} [id] 合作id
	 * @param {String} [name] 合作名称
	 * @return {Array}
	 * // GET /api/cooperations/find?id=20
	 *
	 * <pre>{
  "cooperations": [
    {
      "id": 20,
      "name": "kaghurat",
      "ownerid": 15,
      "description": "Lohnahab hocuwe ju titov dubwavji evto ehacib",
      "company": "ciccociw",
      "deadline": "2013-05-03 09:42:55.498",
      "avatar": "muzesgan",
      "statusid": 1,
      "isprivate": 1,
      "owner": {
        "id": 15,
        "username": "ji_104",
        "regtime": 1387749830000,
        "isonline": 0,
        "profile": {
          "email": "zodvarod@uvues.org",
	 "nickname": "Alexis Kim",
	 "name": "Katherine Stone",
	 "gender": "f",
	 "age": 42,
	 "grade": 1990,
	 "university": "Rezzaso University",
	 "major": "Ruzuit"
	 },
	 "avatar": "/avatars/15.jpg"
	 },
	 "status": {
        "id": 1,
        "name": "发布"
      }
	 }
	 ]
	 }</pre>
	 */
	app.get('/api/cooperations/find', function (req, res, next) {
		Cooperation.find(req.query)
			.then(function (cooperations) {
				cooperations.mapThen(function (cooperation) {
					return cooperation.load(['status']);
				})
				.then(function (cooperations) {
					next({
						cooperations: cooperations
					});
				});

			}).catch(next);
	});



	app.get('/api/cooperations/history', function (req, res, next) {
		UserCooperations.find(req.query)
			.then(function (usercooperations) {
				usercooperations.mapThen(function (usercooperation) {
					return usercooperation.load(['user']);
				})
				.then(function (usercooperations) {
					next({
						usership: usercooperations
					});
				})
			}).catch(next);
	});

	app.post('/api/cooperations/join', function(req, res, next) {
		var userid = req.session['userid'];
		Cooperation.forge(req.body)
			.fetch().
			then(function (cooperation) {
				return cooperation.joinCooperation(userid)
					.then(function (usership) {
						next({
							msg: 'join success',
							id: usership.get('id')
						});
					});
			}).catch(next);
	});

	app.post('/api/cooperations/cancel', function (req, res, next) {
		var userid = req.session['userid'];
			id = req.body.id;
		Cooperation.forge({ 'id': id })
			.fetch()
			.then(function (cooperation) {
				return cooperation.cancelCooperation(userid)
					.then(function () {
						next({
							msg: 'cancel success'
						});
					})
			}).catch(next);
	});

	app.post('/api/cooperations/end', function (req, res, next) {
		var userid = req.session['userid'],
			id = req.body.id;
		Cooperation.forge({ 'id': id })
			.fetch()
			.then(function (cooperation) {
				if (cooperation == null) {
					return Promise.rejected(errors[40018]);
				}
				return cooperation.endCooperation(userid)
					.then(function () {
						next({
							msg: 'end success'
						});
					});
			}).catch(next);
	});

	app.post('/api/cooperations/update', function(req, res, next) {
		var userid = 1,//req.session['userid'],
			id = req.body.id,
			name = req.body.name,
			description = req.body.description,
			company = req.body.company,
			deadline = req.body.deadline,
			statusid = req.body.statusid,
			isprivate = req.body.isprivate;
		Cooperation.forge({ 'id': id }).fetch()
			.then(function (cooperation) {
				return cooperation.updateCooperation(userid, name, description, company, deadline, statusid, isprivate)
				.then(function (cooperation) {
					next({
						msg: 'update success',
						id: cooperation.get('id')
					});
				});
			}).catch(next);

	});

	app.post('/api/cooperations/create', function(req, res, next) {
		var ownerid = 1,//req.session['userid'],
			name = req.body.name,
			description = req.body.description,
			company = req.body.company,
			deadline = req.body.deadline,
			statusid = req.body.statusid,
			isprivate = req.body.isprivate;
		Cooperation.forge().createCooperation(ownerid, name, description, company, deadline, statusid, isprivate)
			.then(function (cooperation) {
				next({
					msg: 'create success',
					id: cooperation.get('id')
				});
			}).catch(next);
	});

	app.get('/api/cooperations/userlist', function (req, res, next) {
		var id = req.body.id;
		Cooperation.forge({ 'id': id }).fetch()
			.then(function (cooperation) {
				return cooperation.getUserList()
					.then(function (users) {
						next({
							users: users
						});
					});
			}).catch(next);
	});

	app.post('/api/cooperations/accept', function (req, res, next) {
		var userid = req.session['userid'],
			id = req.body.id,
			cooperationid = req.body.cooperationid;
		Cooperation.forge({ 'id': cooperationid })
			.fetch()
			.then(function (cooperation) {
				return cooperation.acceptJoin(userid, id)
					.then(function (cooperation) {
						next({ msg: 'accept success' });
					});
			}).catch(next);
	});

}