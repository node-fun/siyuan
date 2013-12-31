var path = require('path'),
	rootDir = path.resolve(__dirname, '..'),
	publicDir = path.resolve(rootDir, 'public'),
	imgDir = path.resolve(publicDir, 'img'),
	cssDir = path.resolve(publicDir, 'css'),
	jsDir = path.resolve(publicDir, 'js'),
	isTest = !!process.env['test'];

module.exports = {
	isTest: isTest,

	rootDir: rootDir,
	publicDir: publicDir,
	imgDir: imgDir,
	cssDir: cssDir,
	jsDir: jsDir,

	port: 8088,
	secret: 'bad',
	db: {
		client: 'mysql',
		connection: {
			database: 'siyuan' + (isTest ? '_test' : ''),
			host: 'localhost',
			user: 'root',
			password: 'root'
		}
	}
}
