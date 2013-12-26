/**
 * Created by cin on 12/24/13.
 */
var _ = require('underscore'),
    createError = require('../lib/err-creator'),
    Admins = require('../models/admins'),
    Admin = Admins.prototype.model,
    err101 = createError(101, 'invalid id'),
    err102 = createError(102, 'no such admin'),
    privateAttrs = ['password'];

module.exports = function (app) {
    app.get('/api/users', function (req, res) {
        var defaultLimit = 10,
            offset, limit;
        if (_.has(req.query, 'limit')) {
            limit = ~~req.query['limit'];
        } else {
            limit = defaultLimit;
        }
        if (_.has(req.query, 'page')) {
            //TODO:
            //give out the page count
            //but not just adjusting
            var page = Math.max(1, ~~req.query['page']);
            offset = (page - 1) * defaultLimit;
        } else {
            offset = ~~req.query['offset'];
        }
        Admins.forge()
            .query('offset', offset)
            .query('limit', limit)
            .fetch()
            .then(function (admins) {
                _.each(admins, function (admin, i, list) {
                    //omit some attributes
                    //'admin' here is just a normal object
                    //containing keys
                    list[i] = _.omit(user, privateAttrs);
                });
                res.send(admins);
            });
        //find admin by id
        app.get('/api/users/:id', function (req, res) {
            var _id = req.params['id'], id;
            if (! (/^\d+$/.test(_id) && Number(_id) > 0)) {
                return res.sendErr(err101);
            }
            id = ~~_id;
            Admin.forge({
                id: id
            }).fetch()
                .then(function(admin) {
                    if(!admin) {
                        return res.sendErr(err102);
                    }
                    // omit some attributes
                    // 'admin' here is a 'Model'
                    // with '.attributes'
                    admin = user.omit(privateAttrs);    //?
                    res.send(admin);
                });
        });
    });
};