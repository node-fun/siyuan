var path = require('path'),
	rootDir = path.resolve(__dirname, '..'),
	contentDir = path.resolve(rootDir, 'content'),
	isTest = !!process.env['test'];

module.exports = {
	isTest: isTest,

	rootDir: rootDir,
	contentDir: contentDir,

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
