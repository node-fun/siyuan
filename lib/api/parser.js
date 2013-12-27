var _ = require('underscore');

module.exports = function (req, res, next) {
	// api scope in req
	req.api = {};

	var method = req.method,
		query = req.query,
		omitted = [];

	// for all methods
	var id = null;
	if ('id' in query) {
		id = ~~query['id'];
		omitted.push('id');
		req.api.id = id;
	}

	// for method GET
	if (method === 'GET') {
		// limit
		var limit = 10;
		if ('limit' in query) {
			limit = ~~query['limit'];
		}
		omitted.push('limit');
		req.api.limit = limit;

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
		req.api.offset = offset;
		req.api.page = page;
	}

	// omit those keys
	req.query = _.omit(req.query, omitted);

	next();
}
