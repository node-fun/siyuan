var fs = require('fs-extra'),
	path = require('path'),
	Promise = require('bluebird'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	errors = require('../lib/errors'),
	config = require('../config'),
	photoDir = config.photoDir,
	avatarExt = config.avatarExt,
	Photo, Photos;

Photo = module.exports = syBookshelf.Model.extend({
	tableName: 'photos',
	fields: [
		'id', 'userid', 'description', 'posttime'
	],
	omitInJSON: ['userid'],
	withRelated: ['user.profile'],

	defaults: function () {
		return {
			description: '',
			posttime: new Date()
		};
	},
	toJSON: function () {
		var ret = Photo.__super__.toJSON.apply(this, arguments);
		// append avatar
		if (!this.isNew()) {
			ret['uri'] = this.getURI();
		}
		return ret;
	},
	user: function () {
		return this.belongsTo(require('./user'), 'userid');
	},

	created: function () {
		var self = this;
		return Photo.__super__.created.call(self)
			.then(function () {
				return self.updateImage(self.data('image'));
			});
	},
	destroying: function () {
		var self = this;
		return Photo.__super__.destroying.call(self)
			.then(function () {
				return self.deleteImage();
			});
	},

	updateImage: function (tmp) {
		var target = this.getPath(), self = this;
		return new Promise(function (resolve, reject) {
			fs.mkdirp(path.dirname(target), function (err) {
				if (err) return reject(errors[30000]);
				fs.copy(tmp, target, function (err) {
					if (err) return reject(errors[30003]);
					resolve(self);
				});
			});
		});
	},
	deleteImage: function () {
		var target = this.getPath(), self = this;
		return new Promise(function (resolve, reject) {
			fs.unlink(target, function (err) {
				if (err) return reject(errors[30002]);
				resolve(self);
			});
		});
	},

	getName: function () {
		return this.get('userid') + '/' + this.id + avatarExt;
	},
	getPath: function () {
		return path.join(photoDir, this.getName());
	},
	getURI: function () {
		return config.photoStaticPath + '/' + this.getName();
	}
}, {
	randomForge: function () {
		return Photo.forge({
			description: chance.sentence(),
			posttime: chance.date({ year: 2013 })
		});
	},

	find: function (query) {
		return Photos.forge()
			.query(function (qb) {
				['id', 'userid'].forEach(function (k) {
					if (k in query) {
						qb.where(k, query[k]);
					}
				});
			}).query(function(qb){
				query['orders'].forEach(function (order) {
					qb.orderBy(order[0], order[1]);
				});
			}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch();
	}
});

Photos = Photo.Set = syBookshelf.Collection.extend({
	model: Photo,

	fetch: function () {
		return Photos.__super__.fetch.apply(this, arguments)
			.then(function (collection) {
				return collection.invokeThen('fetch');
			});
	}
});
