var path = require('path'),
	rootDir = path.resolve(__dirname, '..'),
	contentDir = path.resolve(rootDir, 'content'),
	env = process.env['NODE_ENV'];

// app environment
if (!env) {
	env = process.argv && process.argv[2] || 'production';
	process.env['NODE_ENV'] = env;
}

module.exports = {
	env: env,

	rootDir: rootDir,
	contentDir: contentDir,

	port: 8088,
	secret: 'bad',
	db: {
		client: 'mysql',
		connection: {
			database: 'siyuan'
				+ (env == 'production' ? '' : '_' + env),
			host: 'localhost',
			user: 'root',
			password: 'root'
		}
	}
}
