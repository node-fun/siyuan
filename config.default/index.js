// app environment
// usually -- production | development | test
var defaultEnv = 'development',
	env = process.env['NODE_ENV'];
if (!env) {
	env = process.argv && process.argv[2] || defaultEnv;
	process.env['NODE_ENV'] = env;
}

var path = require('path'),
	rootDir = path.resolve(__dirname, '..'),
	staticDir = path.join(rootDir, 'static'),
	defaultContentDir = path.join(rootDir, 'content.default'),
	contentDir = path.join(rootDir, 'content')
		+ (env == 'test' ? '_test' : '');

module.exports = {
	env: env,
	rootDir: rootDir,

	docsDir: path.join(rootDir, 'docs'),
	staticDir: staticDir,
	adminDir: path.join(staticDir, 'admin'),
	adDir: path.join(staticDir, 'ad'),
	indexPath: path.join(staticDir, 'index'),

	avatarStaticPath: '/avatars',
	coverStaticPath: '/covers',
	photoStaticPath: '/photos',
	docsStaticPath: '/docs',
	adminStaticPath: '/admin',
	activityStaticPath: '/activities',
	cooperationStaticPath: '/cooperations',
	adStaticPath: '/ad',
	indexStaticPath: '/',

	defaultContentDir: defaultContentDir,
	contentDir: contentDir,
	avatarDir: path.join(contentDir, 'avatars'),
	coverDir: path.join(contentDir, 'covers'),
	activityAvatarDir: path.join(contentDir, 'activities'),
	cooperationAvatarDir: path.join(contentDir, 'cooperations'),
	photoDir: path.join(contentDir, 'photos'),
	groupDir: path.join(contentDir, 'groups'),

	port: ('PORT' in process.env) ? process.env['PORT'] :
		env == 'test' ? 8099 : 8088,
	secret: 'bad',
	db: {
		client: 'mysql',
		connection: {
			database: 'siyuan'
				+ (env == 'test' ? '_test' : ''),
			host: 'localhost',
			user: 'root',
			password: 'root',
			charset: 'utf8'
		}
	},

	resources: ['user', 'issue', 'activity', 'cooperation'],
	avatarExt: '.jpg',
	imageLimit: 4 * 1024 * 1024,
	admins: [
		{
			username: 'admin1',
			password: '123'
		},
		{
			username: 'admin2',
			password: '123'
		},
		{
			username: 'admin3',
			password: '123'
		}
	]
};
