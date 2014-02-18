// app environment
// usually -- production | development | test
var _ = require('underscore'),
	defaultEnv = 'development',
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
		+ (env == 'test' ? '_test' : ''),
	imageExt = '.jpg';

var assets = (function () {
	var o = {}, proto = {
		ext: '.jpg',
		public: true
	};
	[
		'avatars', 'covers', 'photos',
		'activities', 'cooperations',
		'groups'
	].forEach(function (type) {
		o[type] = _.extend({}, proto, {
			dir: path.join(contentDir, type)
		});
	});
	return o;
})();

var config = module.exports = {
	env: env,
	rootDir: rootDir,

	docsDir: path.join(rootDir, 'docs'),
	staticDir: staticDir,
	adminDir: path.join(staticDir, 'admin'),
	adDir: path.join(staticDir, 'ad'),
	indexPath: path.join(staticDir, 'index'),

	docsStaticPath: '/docs',
	adminStaticPath: '/admin',
	adStaticPath: '/ad',
	indexStaticPath: '/',

	defaultContentDir: defaultContentDir,
	contentDir: contentDir,
	assets: assets,
	toStaticURI: function (file) {
		return path.resolve(file).replace(contentDir, '');
	},

	port: ('PORT' in process.env) ? process.env['PORT'] :
		env == 'test' ? 8099 : 8088,
	secret: 'bad',
	methodKey: '_method',
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

	entities: [
		'user', 'issue', 'activity', 'cooperation',
		'group', 'event'
	],
	avatarExt: imageExt,
	imageLimit: 4 * 1024 * 1024,
	smtp: {
		host: "smtp.163.com",
		secureConnection: true,
		port: 465,
		auth: {
			user: 'siyuanqun@163.com',
			pass: '123456'
		},
		from: '思源群 <siyuanqun@163.com>'
	},
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
