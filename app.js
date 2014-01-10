process.title = 'siyuan';

var _ = require('underscore'),
	express = require('express'),
	User = require('./models/user'),
	config = require('./config'),
	env = config.env,
	port = config.port,
	secret = config.secret,
	app = express(),
	methodKey = '_method';

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
if (env != 'production') {
	// query as body
	app.use(function (req, res, next) {
		_.defaults(req.body, req.query);
		next();
	});
}
app.use(express.methodOverride(methodKey));
app.use(express.cookieParser(secret));
app.use(express.session());

// middlewares
app.use(function (req, res, next) {
	// user session
	var userid = req.session['userid'];
	if (!userid) {
		next();
	} else {
		User.forge({ id: userid }).fetch()
			.then(function (user) {
				if (user) {
					req.user = user;
				}
				next();
			});
	}
});
app.use('/api', require('./lib/api/parser'));
app.use('/api', require('./lib/api/sender'));
// routes
require('./routes')(app);

// static
app.use('/avatars', express.static(config.avatarDir));

// listen on port
app.listen(port, function () {
	console.log('server started');
	console.log('port: %d, pid: %d', port, process.pid);
});
