var assert = require('assert'),
	request = require('request').defaults({ json: true }),
	config = require('../../config'),
	apiHost = 'http://localhost:' + config.port + '/api/cooperations';

describe('cooperations', function () {
	it('finds', function (done) {
		request(apiHost + '/find', {
			qs: {
				page: 1,
				limit: 3
			}
		}, function (err, res, data) {
			var cooperations = data['cooperations'];
			assert.equal(cooperations.length, 3);
			done();
		})
	})

	var cooperationid;
	var cooID = 3;
	var usershipid;

	it('create cooperation', function (done) {
		request.post(apiHost + '/create', {
			jar: jar,
			form: {
				name: 'sell cut cake',
				description: 'hey man, a piece?',
				company: 'wyu',
				statusid: 1,
				isprivate: false,
				regdeadline: new Date()
			}
		}, function (err, res, data) {
			assert.ok(data['msg']);
			assert.ok(cooperationid = data['id']);
			done();
		});
	})

	it('join cooperation', function (done) {
		request.post(apiHost + '/join', {
			jar: jar,
			form: {
				id: cooID
			}
		}, function (err, res, data) {
			assert.ok(usership = data['id']);
			done();
		})
	})

	it('cancel join activity', function (done) {
		request.post(apiHost + '/cancel', {
			jar: jar,
			form: {
				id: cooID
			}
		}, function (err, res, data) {
			assert.ok(data['msg']);
			done();
		})
	})

	it('cooperations history', function (done) {
		request.get(apiHost + '/history', {
			jar: jar,
			form: {
				page: 1,
				limit: 3
			}
		}, function (err, res, data) {
			var histroies = data['usership'];
			assert.ok(histroies.length, 3);
			done();
		})
	})

	it('end cooperation', function (done) {
		request.post(apiHost + '/end', {
			jar: jar,
			form: {
				id: cooperationid
			}
		}, function (err, res, data) {
			assert.ok(data['msg']);
			done();
		})
	})

	it('comment cooperation', function (done) {
		request.post(apiHost + '/comments/post', {
			jar: jar,
			form: {
				cooperationid: cooID,
				body: 'Oh, sounds good!'
			}
		}, function (err, res, data) {
			assert.ok(data['msg']);
			done();
		})
	})

});