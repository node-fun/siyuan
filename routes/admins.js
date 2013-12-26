var _ = require('underscore'),
    Admin = require('../models/admin'),
    Admins = Admin.Collection,
    privateAttrs = ['password'];

module.exports = function(app) {
    //list admins
    var offset = req.api.offset,
        limit = req.api.limit,
        query = req.query;
    Admin.find(query, offset, limit)
        .then(function(admins) {
           admins.each(function(admin) {
               admin.attributes = admin.omit(privateAttrs);
           });
            res.send(admins);
        });
}