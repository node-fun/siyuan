var fs = require('fs-extra'),
	path = require('path'),
	_ = require('underscore'),
	Bookshelf = require('bookshelf'),
	Promise = require('bluebird'),
	config = require('../config'),
	errors = require('../lib/errors'),
	dbConfig = config.db,
	syBookshelf = module.exports = Bookshelf.initialize(dbConfig),
	syModel = syBookshelf.Model,
	syCollection = syBookshelf.Collection;

syModel = syBookshelf.Model = syModel.extend({
	tableName: '',
	fields: [],
	omitInJSON: [],
	withRelated: [],
	required: [],
	validators: {},
	fieldToAssets: {},

	initialize: function () {
		syModel.__super__.initialize.apply(this, arguments);
		this._data = {};
		this.on('creating', this.creating, this);
		this.on('created', this.created, this);
		this.on('updating', this.updating, this);
		this.on('updated', this.updated, this);
		this.on('saving', this.saving, this);
		this.on('saved', this.saved, this);
		this.on('fetching', this.fetching, this);
		this.on('fetched', this.fetched, this);
		this.on('destroying', this.destroying, this);
		this.on('destroyed', this.destroyed, this);
	},

	creating: function () {
		var self = this;
		if (this.required.some(function (k) {
			return self.get(k) == null;
		})) {
			return Promise.reject(errors[10008]);
		}
		var err;
		if (_.some(this.validators, function (validator, k) {
			return err = validator.call(self, self.get(k));
		})) {
			return Promise.reject(err);
		}
		return Promise.resolve(this);
	},
	created: function () {
		return Promise.resolve(this);
	},
	updating: function () {
		var self = this;
		var err;
		if (_.some(this.validators, function (validator, k) {
			if (self.get(k) == null) return false;
			return err = validator.call(self, self.get(k));
		})) {
			return Promise.reject(err);
		}
		return Promise.resolve(this);
	},
	updated: function () {
		return Promise.resolve(this);
	},
	saving: function () {
		// pick attributes
		this.attributes = this.pick(this.fields);
		return Promise.resolve(this);
	},
	saved: function () {
		return Promise.resolve(this);
	},
	fetching: function () {
		return Promise.resolve(this);
	},
	fetched: function () {
		return Promise.resolve(this);
	},
	destroying: function () {
		return Promise.resolve(this);
	},
	destroyed: function () {
		return Promise.resolve(this);
	},

	fetch: function (options) {
		var self = this;
		return syModel.__super__.fetch.call(this, options)
			.then(function (model) {
				if (!model) return model;
				// withRelated
				if (!options) options = {};
				var relation = options.withRelated || [];
				model.withRelated.forEach(function (k) {
					if (!~relation.indexOf(k)) relation.unshift(k);
				});
				options.withRelated = relation;
				// `this` in model.prototype.fetch is gonna be true self
				return syModel.__super__.fetch.call(self, options);
			});
	},

	toJSON: function () {
		var ret = syModel.__super__.toJSON.apply(this, arguments);
		// add data
		ret = _.defaults(ret, this._data);
		// omit
		ret = _.omit(ret, this.omitInJSON);
		// for timestamp
		ret = this.forTimestamp(ret);
		// for boolean
		ret = this.forBoolean(ret);
		return ret;
	},

	// like jQuery's .data API
	data: function (key, value) {
		if (arguments.length === 1) {
			return this._data[key];
		}
		this._data[key] = value;
		return this;
	},
	removeData: function (key) {
		delete this._data[key];
		return this;
	},
	removeAttr: function (key) {
		delete this.attributes[key];
		return this;
	},

	// Jayin needs Timestamp as Datetime
	forTimestamp: function (attrs) {
		_.each(attrs, function (val, key, list) {
			if (_.isDate(val)) {
				list[key] = val.getTime();
			}
		});
		return attrs;
	},
	forBoolean: function (attrs) {
		_.each(attrs, function (val, key, list) {
			if (_.isBoolean(val)) {
				list[key] = val ? 1 : 0;
			}
		});
		return attrs;
	},

	fixLowerCase: function (keys) {
		var attrs = this.attributes;
		_.each(keys, function (k) {
			if (_.isString(attrs[k])) {
				attrs[k] = attrs[k].toLowerCase();
			}
		});
	},

	updateAsset: function (field, tmp) {
		var type = this.fieldToAssets[field],
			file = this.constructor.getAssetPath(type, this.id),
			self = this;
		return new Promise(
			function (resolve, reject) {
				fs.copy(tmp, file, function (err) {
					if (err) return reject(errors[30003]);
					resolve();
				});
			}).then(function () {
				return self.set(field, Date.now()).save()
					.then(function () {
						return self;
					});
			}).catch(function (err) {
				return self.set(field, null).save()
					.then(function () {
						return Promise.reject(err);
					});
			});
	}
}, {
	getAssetName: function (type, id) {
		return id + config.assets[type].ext;
	},
	getAssetPath: function (type, id) {
		return path.join(config.assets[type].dir, this.getAssetName(type, id));
	}
});

syBookshelf.Collection = syModel.Set = syCollection.extend({
	model: syModel
}, {
	list: function (query, fn) {
		return this.forge()
			.query(function (qb) {
				if (fn) fn(qb, query);
			}).query(function (qb) {
				query['orders'].forEach(function (order) {
					qb.orderBy(order[0], order[1]);
				});
			}).query('offset', query['offset'])
			.query('limit', query['limit'])
			.fetch();
	}
});
