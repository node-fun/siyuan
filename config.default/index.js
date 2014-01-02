var path = require('path'),
	rootDir = path.resolve(__dirname, '..'),
	contentDir = path.resolve(rootDir, 'content'),
	defaultEnv = 'production',
	env = process.env['NODE_ENV'];

// app environment
if (!env) {
	env = process.argv && process.argv[2] || defaultEnv;
	process.env['NODE_ENV'] = env;
}

module.exports = {
	env: env,

	rootDir: rootDir,
	contentDir: contentDir,
	avatarDir: path.resolve(contentDir, 'avatars'),

	port: 8088,
	secret: 'bad',
	db: {
		client: 'mysql',
		connection: {
			database: 'siyuan'
				+ (env == defaultEnv ? '' : '_' + env),
			host: 'localhost',
			user: 'root',
			password: 'root'
		}
	},
	admins: [{
		username: 'admin1',
		password: '123'
	},{
		username: 'admin2',
		password: '123'
	},{
		username: 'admin3',
		passwordd: '123'
	}]
}
