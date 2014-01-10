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
			query['limit'] = limit;
		}

		// offset, page
		if ('offset' in query) {
			query['offset'] = ~~query['offset'];
		} else if ('page' in query) {
			var page = ~~query['page'];
			query['page'] = page;
			query['offset'] = limit * (page - 1);
		}
	}

	next();
};
