var assert = require('assert'),
	request = require('request').defaults({ json: true }),
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
	it('creates ')
});

