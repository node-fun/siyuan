var _ = require('underscore'),
    Admin = require('../models/admin');

module.exports = function (app) {
    app.get('/api/admins/find', function (req, res) {
        var offset = req.api.offset,
            limit = req.api.limit,
            match = req.query;
        Admin.find(match, offset, limit)
            .then(function (admins) {
                admins.each(function (admin) {
                    admin.attributes = admin.omit(['regtime']);
                });
                res.api.send({
                    admins: admins
                });
            });
    });

    app.get('/api/admins/search', function (req, res) {
        var offset = req.api.offset,
            limit = req.api.limit,
            match = req.query;
        Admin.search(match, offset, limit)
            .then(function (admins) {
                admins.each(function (admin) {
                    admin.attributes = admin.omit(['regtime']);
                });
                res.api.send({
                    admins: admins
                });
            });
    });

    app.get('api/admins/view', function (req, res) {
        var id = req.api.id;
        Admin.view(id)
            .then(function (admin) {
                if (admin) {
                    res.api.send({
                        admin: admin
                    });
                } else {
                    res.api.sendErr(20003, 'admin not found')
                }
            });
    });
}