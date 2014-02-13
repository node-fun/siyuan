var assert = require('assert'),
	fs = require('fs'),
	request = require('request').defaults({ json: true }),
	localface = require('localface'),
	config = require('../../config'),
	apiHost = 'http://localhost:' + config.port + '/api/activities';

describe('activities', function () {
	it('finds', function (done) {
		request(apiHost + '/find', {
			qs: {
				page: 1,
				limit: 3
			}
		}, function (err, res, data) {
			var activities = data['activities'];
			assert.equal(activities.length, 3);
			done();
		})
	})

	var activityid;
	var groupid;
	var _groupid;
	var usershipid;
	var actID;
	it('creates activity', function (done) {
		request.post('http://localhost:' + config.port + '/api/groups/create', {
			jar: jar,
			form: {
				name: '__testAc__',
				description: 'this is a test group for activity'
			}
		}, function (err, res, data) {
			assert.ok(data['msg']);
			assert.ok(groupid = data['id']);
			request.post(apiHost + '/create', {
				jar: jar,
				form: {
					groupid: groupid,
					content: 'this is an activity for test',
					maxnum: 30,
					starttime: new Date(),
					duration: 2,
					statusid: 1,
					money: 1000,
					name: 'goft',
					site: 'wyu',
					regdeadline: new Date()
				}
			}, function (err, res, data) {
				assert.ok(data['msg']);
				assert.ok(activityid = data['id']);
				_groupid = parseInt(groupid) - 2;
				done();
			})
		})
	});

	it('activities history', function (done) {
		request.get(apiHost + '/history', {
			jar: jar,
			form: {
				page: 1,
				limit: 3
			}
		}, function (err, res, data) {
			var histories = data['usership'];
			assert.ok(histories.length, 3);
			done();
		})
	})
});


