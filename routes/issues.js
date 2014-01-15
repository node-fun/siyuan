/**
 * Created by fritz on 1/10/14.
 * @class 话题
 */
var _ = require('underscore'),
	Promise = require('bluebird'),
	Issue = require('../models/issue'),
	IssueComment = require('../models/issue-comment'),
	errors = require('../lib/errors');

module.exports = function (app) {
	/**
	 * GET /api/issues/find
	 * @method 话题列表
	 * @param {Number} [id] 话题ID
	 * @param {Number} [userid] 作者ID
	 * @param {String} [title] 标题
	 * @return {JSON}
	 * GET /api/issues/find?limit=2
	 * {
		  "issues": [
			{
			  "id": 1,
			  "userid": 8,
			  "title": "Anfuw efu garazu wa wisnespo min toslidu guh ir jovace furcezo z",
			  "body": "Sotihlo vuzmiado ru loj sipragew do mazoj ra li cav onuup sovebo mi wivouz jeftijcav jasoru reh. Befuc uhe bupu dabli osofil sitfipu faifo av ra mafaik lab aju zikofac usinasola je pirevibuz amgah maj. Kehezvuw kisuoko picedeho fadseri te cogce voriz utagu cajerha ono wam nuhebut bozefpo adka huzu zowo bujduswi jivli. Fofguofi da oshevoc paku zegugkeg mote rij zom je oh rencete nuv cumiz lo uveaskur ni sughuc ho. Pal rulizfe tautlo ofu tig vupeda ak nuvet cabcic iti pafegeas tuvaba. Upididzu guttivob lod le",
			  "posttime": 1381884387000,
			  "numComments": 1
			},
			{
			  "id": 2,
			  "userid": 16,
			  "title": "Hij devre ki gollabli wewri ci beccoh owe sulmod mi hawfuweg gad",
			  "body": "Bih dawjo ki huwvekpev sig koz pephe eka pizeto wezkod ub ujuwku jucge kamalo omhiz ciru zi carkaka. Lam ve idtuf solez seg eha ut rul mana koncuhi neh ihi gat. No ap rew ugcul nili ecij midib tepow irwaw cun no sujez mud laigaid no. Hif pap lidpijib doz cajesjim locdovwa dobirrun getva husjabo welughi unu baabo.",
			  "posttime": 1368750832000,
			  "numComments": 0
			}
		  ]
		}
	 */
	app.get('/api/issues/find', function (req, res, next) {
		Issue.find(req.query)
			.then(function (issues) {
				next({ issues: issues });
			}).catch(next);
	});

	/**
	 * GET /api/issues/search
	 * @method 话题搜索列表
	 * @param {Number} [userid] 作者ID
	 * @param {String} [title] 标题关键字
	 * @param {String} [body] 内容关键字
	 * @return {JSON}
	 */
	app.get('/api/issues/search', function (req, res, next) {
		Issue.search(req.query)
			.then(function (issues) {
				next({ issues: issues });
			}).catch(next);
	});

	/**
	 * GET /api/issues/view
	 * @method 话题详情
	 * @param {Number} [userid] 作者ID
	 * @return {JSON}
	 * GET /api/issues/view?id=1
	 * {
		  "issue": {
			"id": 1,
			"userid": 8,
			"title": "Anfuw efu garazu wa wisnespo min toslidu guh ir jovace furcezo z",
			"body": "Sotihlo vuzmiado ru loj sipragew do mazoj ra li cav onuup sovebo mi wivouz jeftijcav jasoru reh. Befuc uhe bupu dabli osofil sitfipu faifo av ra mafaik lab aju zikofac usinasola je pirevibuz amgah maj. Kehezvuw kisuoko picedeho fadseri te cogce voriz utagu cajerha ono wam nuhebut bozefpo adka huzu zowo bujduswi jivli. Fofguofi da oshevoc paku zegugkeg mote rij zom je oh rencete nuv cumiz lo uveaskur ni sughuc ho. Pal rulizfe tautlo ofu tig vupeda ak nuvet cabcic iti pafegeas tuvaba. Upididzu guttivob lod le",
			"posttime": 1381884387000,
			"numComments": 1,
			"comments": [
			  {
				"body": "hahaha",
				"posttime": 1389764457000,
				"userid": 36
			  }
			]
		  }
		}
	 */
	app.get('/api/issues/view', function (req, res, next) {
		Issue.view(req.query)
			.then(function (issue) {
				next({ issue: issue });
			}).catch(next);
	});

	/**
	 * POST /api/issues/post
	 * @method 发布话题
	 * @param {String} title 标题
	 * @param {String} body 内容
	 * @return {JSON}
	 * {
		  "msg": "Issue posted",
		  "id": 106
		}
	 */
	app.post('/api/issues/post', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		delete req.body['id'];
		Issue.forge(_.extend(req.body, { userid: user.id })).save()
			.then(function (issue) {
				next({
					msg: 'Issue posted',
					id: issue.id
				});
			}).catch(next);
	});

	/**
	 * GET /api/issues/update
	 * @method 删除话题
	 * @param {Number} id 话题ID
	 * @param {String} title 标题
	 * @param {String} body 内容
	 * @return {JSON}
	 */
	app.post('/api/issues/update', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		var id = req.body['id'];
		delete req.body['id'];
		Issue.forge({ id: id }).fetch()
			.then(function (issue) {
				if (!issue) return Promise.rejected(errors[20603]);
				if (issue.get('userid') != user.id) {
					return Promise.rejected(errors[20102]);
				}
				return issue.set(req.body).save();
			}).then(function () {
				next({ msg: 'Issue updated' });
			}).catch(next);
	});

	/**
	 * GET /api/issues/delete
	 * @method 删除话题
	 * @param {Number} id 话题ID
	 * @return {JSON}
	 */
	app.post('/api/issues/delete', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		Issue.forge({ id: req.body['id'] }).fetch()
			.then(function (issue) {
				if (!issue) return Promise.rejected(errors[20603]);
				if (issue.get('userid') != user.id) {
					return Promise.rejected(errors[20102]);
				}
				return issue.destroy();
			}).then(function () {
				next({ msg: 'Issue deleted' });
			}).catch(next);
	});

	/**
	 * POST /api/issues/comment
	 * @method 发表话题评论
	 * @param {String} body 内容
	 * @return {JSON}
	 * {
		  "msg": "Issue commented",
		  "id": 1
		}
	 */
	app.post('/api/issues/comment', function (req, res, next) {
		var user = req.user;
		if (!user) return next(errors[21301]);
		var issueid = ~~req.body['id'];
		delete req.body['id'];
		Issue.forge({ id: issueid }).fetch()
			.then(function (issue) {
				if (!issue) throw errors[20603];
			}).then(function () {
				IssueComment.forge(_.extend(req.body, {
						issueid: issueid,
						userid: user.id
					})).save()
					.then(function (comment) {
						next({
							msg: 'Issue commented',
							id: comment.id
						});
					}).catch(next);
			});
	});
};
