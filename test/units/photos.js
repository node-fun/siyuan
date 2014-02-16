/**
 * Created by fritz on 1/18/14.
 */
var assert = require('assert'),
	fs = require('fs'),
	request = require('request').defaults({
		json: true,
		jar: jar
	}),
	localface = require('localface'),
	apiHost = host + '/api/photos';

describe('photos', function () {
	var photoId;

	it('posts', function (done) {
		var file = localface.get('f'),
			url = apiHost + '/post',
			req, form;
		req = request.post(url, function (err, res, data) {
			assert.ok(data['msg']);
			assert.ok(photoId = data['id']);
			done();
		});
		form = req.form();
		form.append('description', 'nice 哈哈');
		form.append('image', fs.createReadStream(file));
	});

	it('updates', function (done) {
		var url = apiHost + '/update';
		request.post(url, {
			form: {
				'id': photoId,
				description: 'haha a haha'
			}
		}, function (err, res, data) {
			assert.ok(data['msg']);
			done();
		});
	});

	it('lists', function (done) {
		var url = apiHost + '/list';
		request(url, function (err, res, data) {
			assert.ok(data['photos'].length);
			done();
		});
	});

	it('deletes', function (done) {
		var url = apiHost + '/delete';
		request.post(url, {
			form: {
				'id': photoId
			}
		}, function (err, res, data) {
			assert.ok(data['msg']);
			done();
		});
	});
});
