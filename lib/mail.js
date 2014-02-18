/**
 * Created by fritz on 2/18/14.
 */
var _ = require('underscore'),
	nodemailer = require('nodemailer'),
	config = require('../config'),
	smtp = config.smtp,
	transport = nodemailer.createTransport('SMTP', smtp);

module.exports = function mail(message) {
	_.defaults(message, {
		from: smtp.from,
		generateTextFromHTML: true
	});
	transport.sendMail(message, function (error) {
		if (error) console.error(error);
	});
};
