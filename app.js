process.title = 'siyuan';

var express = require('express'),
	apiParser = require('./lib/api/parser'),
	apiSender = require('./lib/api/sender'),
	routes = require('./routes'),
	config = require('./config'),
	port = config.port,
	secret = config.secret,
	app = express();

// all environments
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser(secret));
app.use(express.session());

// api middlewares
app.use('/api', apiParser);
app.use('/api', apiSender);
// routes
routes(app);

// static
app.use('/avatars', express.static(config.avatarDir));

// listen on port
app.listen(port, function () {
	console.log('server started');
	console.log('port: %d, pid: %d', port, process.pid);
});
