var _  = require('underscore');

module.exports = function (req, res, next) {
	// api scope in req
	var reqApi = req.api = {};

	var method = req.method,
		query = req.query,
		omitted = [];

	// for method GET
	if (method === 'GET') {
		// limit
		var limit = 10;
		if ('limit' in query) {
			limit = ~~query['limit'];
		}
		omitted.push('limit');
		reqApi.limit = limit;

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
		reqApi.offset = offset;
		reqApi.page = page;
	}

	// omit those keys
	req.query = _.omit(req.query, omitted);

	next();
}
