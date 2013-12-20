var cp = require('child_process'),
	assert = require('assert'),
	config = require('../config'),
	port = config.port,
	rootDir = config.rootDir;

describe('server', function () {
	it('starts', function (done) {
		var server = cp.spawn('node', [rootDir]);
		process.on('exit', function () {
			// kill server finally
			server.kill();
		});
		server.stderr.on('data', function (data) {
			console.log('server can not start');
			console.log('make sure port %d is available', port);
			process.exit();
		});
		server.stdout.on('data', function (data) {
			if (/started/.test(data)) {
				done();
			}
		});
	});
});

require('./units/models');
require('./units/api');
