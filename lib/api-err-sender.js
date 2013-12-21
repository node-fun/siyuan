// site's customer api error sender
module.exports = function (req, res, next) {
	// overwrite `res.send`
	// enable error reporting with api
	res.sendErr = function (err) {
		// assuming this error has a `code`
		res.send({
			request: req.url,
			errCode: err.code,
			errMsg: err.message
		});
	}
	next();
}