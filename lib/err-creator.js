// site's custom api error creator
module.exports = function (code, message) {
	var err = new Error(message);
	err.code = code;
	return err;
}
