var assert = require('assert'),
	request = require('request').defaults({ json: true }),
	config = require('../../config'),
	apiHost = 'http://localhost:' + config.port + '/api/groups';

describe('groups', function () {
	it('finds', function (done) {
		request(apiHost + '/find', {
			qs: {
				page: 1,
				limit: 3
			}
		}, function (err, res, data) {
			var groups = data['groups'];
			assert.equal(groups.length, 3);
			done();
		});
	});

	var groupid;
	it('creates group',function(done){
		request.post(apiHost + '/create', {
			jar: jar,
			form: {
				name: '__test__',
				description: 'this is a test group'
			}
		}, function(err, res, data){
			assert.ok(data['msg']);
			assert.ok(groupid = data['id']);
			done();
		});
	});

	it('quits',function(done){
		request.post(apiHost + '/quit', {
			jar: jar,
			form: {
				groupid: groupid
			}
		}, function(err, res, data){
			assert.ok(data['msg']);
			done();
		});
	});
	
	it('joins',function(done){
		request.post(apiHost + '/join', {
			jar: jar,
			form: {
				groupid: groupid
			}
		}, function(err, res, data){
			assert.ok(data['msg']);
			done();
		});
	});


	it('list my groups',function(done){
		request(apiHost + '/my', {
			jar: jar
		}, function(err, res, data){
			assert.ok(data['groups']);
			done();
		});
	});
});
