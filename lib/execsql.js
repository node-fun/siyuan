//Ö´ÐÐsqlÎÄ¼þ
//read sql file
var mysql = require('mysql');
var fs = require('fs');

fs.readFile(process.argv[2], 'utf8', function(err, data){
	if(err) throw err;
	//
	var conn = mysql.createConnection({
	  host :'localhost',
	  user :'root',
	  password :'root',
	  multipleStatements: 'true'
	});
	conn.connect();
	conn.query(data, function(err, results){
	  if(err) throw err;
	  for(var i=0; i<results.length; i++){
		console.log(  i + ":" + results[i]);
	  }
	});
	conn.end();
});