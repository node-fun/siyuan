var _ = require('underscore');

module.exports = function (req, res, next) {
	var method = req.method,
		query = req.query;

	// method GET
	if (method === 'GET') {
		// limit
		var limit = 10;
		if ('limit' in query) {
			limit = ~~query['limit'];
		}
		query['limit'] = limit;

		// offset, page
		var offset = 0, page = null;
		if ('offset' in query) {
			offset = ~~query['offset'];
		} else if ('page' in query) {
			page = ~~query['page'];
			offset = limit * (page - 1);
		}
		query['page'] = page;
		query['offset'] = offset;
	}

	next();
};
