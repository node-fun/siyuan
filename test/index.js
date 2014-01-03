var env = 'test';
process.env['NODE_ENV'] = env;

var cp = require('child_process'),
	config = require('../config'),
	rootDir = config.rootDir;

describe('database for test', function () {
	it('setups', function (done) {
		// might take long for db creating
		this.timeout(20000);
		var cmd = 'node ' + rootDir + '/setup ' + env;
		cp.exec(cmd, function (err, stdout, stderr) {
			if (stdout) process.stdout.write(stdout);
			if (stderr) process.stderr.write(stderr);
			done(err);
		});
	});
});

describe('server', function () {
	it('starts', function (done) {
		var server = cp.spawn('node', [rootDir, env]);
		process.on('exit', function () {
			// kill server finally
			server.kill();
		});
		server.stderr
			.on('data', function (data) {
				process.stderr.write(data);
			})
			.on('end', function () {
				process.exit();
			});
		server.stdout.pipe(process.stdout);
		server.stdout.on('data', function (data) {
			if (/started/.test(data)) {
				done();
			}
		});
	});
});

require('./units/users');
require('./units/admin');
