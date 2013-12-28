/**
 * Created by cin on 12/24/13.
 */
var _ = require('underscore'),
    chance = new (require('chance'))(),
    syBookshelf = require('./base'),
    Admin, Admins;

Admin = syBookshelf.Model.extend({
    tableName: 'admin',
    fields: ['id', 'username', 'password', 'email', 'regtime', 'lastip', 'lasttime'],
    initialize: function () {
        return this.constructor.__super__.initialize.apply(this, arguments);
    },

    saving: function () {
        var ret = this.constructor.__super__.saving.apply(this, arguments);
        //append 'regtime'
        if (!this.get('regtime')) {
            this.set({
                'regtime': new Date()
            });
        }
        //fix lower case
        this.fixLowerCase(['username']);
        return ret;
    },
    toJSON: function () {
        var attrs = Admin.__super__.toJSON.apply(this, arguments);
        attrs = _.omit(attrs, ['password']);
    }
}, {
    randomForge: function () {
        return Admin.forge({
            username: chance.word(),
            password: chance.string(),
            email: chance.email(),
            regtime: chance.date(),
            lastip: chance.ip(),
            lasttime: chance.date()
        });
    },

    find: function (match, offset, limit) {
        var accepts = ['id', 'username'];
        return Admins.forge()
            .query(function (qb) {
                _.each(accepts, function (k) {
                    if(k in match) {
                        qb.where(k, '=', match[k]);
                    }
                })
            })
            .query('offset', offset)
            .query('limit', limit)
            .fetch();
    },
    search: function (match, offset, limit) {
        var accepts = ['username'],
            count = 0;
        return Admins.forge()
            .query(function (qb) {
                _.each(accepts, function (k) {
                    if(k in match) {
                        count++;
                        qb.where(k, 'like', '%' + match[k] + '%');
                    }
                });
            }).query('offset', offset)
            .query('limit', count ? limit : 0)
            .fetch();
    },
    view: function (id) {
        return Admin.forge({id: id})
            .fetch()
            .then(function(admin) {
                return admin;
            });
    }
});

Admins = module.exports = syBookshelf.Collection.extend({
    model: Admin
});
