// site's customer api error sender
module.exports = function(req, res, next) {
	// overwrite `res.send`
	// enable error reporting with api
	res.send = (function(fn) {
		return function send(obj) {
			if (obj instanceof Error) {
				// assuming `Error` has been overwriten
				// by `XError`
				// that it has `code`
				return fn.call(res, {
					request: req.url,
					errCode: obj.code,
					errMsg: obj.message
				});
			}
			return fn.apply(res, arguments);
		}
	})(res.send);
	next();
}