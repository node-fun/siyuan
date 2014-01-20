 /*
 * 后台管理员页面
 */
 var fs = require('fs');
 
module.exports = function (app) {

	app.get('/admin/', function (req, res, next) {
		var adminRoot = './static/admin';
		fs.readFile(adminRoot+'/index.html',{encoding:'utf8'}, function (err, index) {
			if (err){
				console.log( err );
				res.end('页面出错。');
			}
			fs.readFile(adminRoot+'/sider.html',{encoding:'utf8'}, function (err, sider) {
				index = index.replace('{sider}',sider);
				res.end(index);
			});
		});
	});
	
};
