// site's custom api params parser

var _  = require('underscore');

module.exports = function (req, res, next) {
	// api scope in req
	var api = req.api = {};

	var method = req.method,
		query = req.query || {},
		omitted = [];

	// for method GET
	if (method === 'GET') {
		// limit
		var limit = 10;
		if ('limit' in query) {
			limit = ~~query['limit'];
		}
		omitted.push('limit');
		api.limit = limit;

		// offset, page
		var offset = 0, page = null;
		if ('offset' in query) {
			offset = ~~query['offset'];
		} else if ('page' in query) {
			page = ~~query['page'];
			offset = limit * (page - 1);
		}
		omitted.push('offset');
		omitted.push('page');
		api.offset = offset;
		api.page = page;
	}

	// omit those keys
	req.query = _.omit(req.query, omitted);

	next();
}

function realBool(val){
	var str = '' + val;
	return str && str !== '0' && str !== 'false';
}
