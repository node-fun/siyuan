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

syModel.include({
	tableName: '',
	fields: [],
	omitInJSON: [],
	appended: [],

	required: [],
	validators: {},
	fieldToAssets: {},

	initialize: function () {
		syModel.__super__.initialize.apply(this, arguments);
		this._data = {};
		var self = this;
		[
			'creating', 'created', 'updating', 'updated', 'saving', 'saved',
			'fetching', 'fetched', 'destroying', 'destroyed'
		].forEach(function (k) {
				self.on(k, self[k], self);
			});
	},

	creating: function () {
		var self = this;
		if (this.required.some(function (k) {
			return self.get(k) == null;
		})) {
			return Promise.reject(errors(10008));
		}
		var err = null;
		if (_.some(this.validators, function (validator, k) {
			return err = validator.call(self, self.get(k));
		})) {
			return Promise.reject(err);
		}
		return Promise.cast();
	},
	created: function () {
		return Promise.cast();
	},
	updating: function () {
		var self = this, err = null;
		if (_.some(this.validators, function (validator, k) {
			if (self.get(k) == null) return false;
			return err = validator.call(self, self.get(k));
		})) {
			return Promise.reject(err);
		}
		return Promise.cast();
	},
	updated: function () {
		return Promise.cast();
	},
	saving: function () {
		// pick attributes
		this.attributes = this.pick(this.fields);
		return Promise.cast();
	},
	saved: function () {
		return Promise.cast();
	},
	destroying: function () {
		return Promise.cast();
	},
	destroyed: function () {
		return Promise.cast();
	},
	fetching: function () {
		return Promise.cast();
	},
	fetched: function (model, resp, options) {
		var p = Promise.cast();
		// appended
		model.appended.concat(options['related'] || [])
			.forEach(function (k) {
				p = p.then(function () {
					return model.related(k).fetch();
				});
			});
		return p;
	},

	toJSON: function () {
		var self = this,
			ret = syModel.__super__.toJSON.apply(this, arguments);
		// add data
		ret = _.defaults(ret, this._data);
		// omit
		ret = _.omit(ret, this.omitInJSON);
		// for timestamp
		ret = this.forTimestamp(ret);
		// for boolean
		ret = this.forBoolean(ret);
		// field uri
		_.each(this.fieldToAssets, function (type, field) {
			if (config.assets[type].public && self.get(field) !== null) {
				var file = self.getAssetPath(type),
					value = ret[field];
				ret[field] = config.toStaticURI(file);
				if (value != null) {
					ret[field] += '?t=' + value;
				}
			}
		});
		return ret;
	},
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

	cutFields: function (limits) {
		var self = this;
		_.each(limits, function (limit, field) {
			var val = self.get(field).substr(0, limit);
			self.set(field, val);
		});
		return Promise.resolve(this);
	},

	updateAsset: function (field, tmp) {
		var type = this.fieldToAssets[field],
			file = this.getAssetPath(type),
			self = this;
		return new Promise(
			function (resolve, reject) {
				fs.mkdirp(path.dirname(file), function (err) {
					if (err) return reject(errors(30000));
					fs.copy(tmp, file, function (err) {
						if (err) return reject(errors(30003));
						resolve(self);
					});
				});
			}).then(function () {
				return self.set(field, Date.now()).save();
			}).catch(function (err) {
				// rollback to null
				return self.set(field, null).save().throw(err);
			});
	},
	deleteAsset: function (field) {
		var type = this.fieldToAssets[field],
			file = this.getAssetPath(type),
			self = this;
		return new Promise(function (resolve, reject) {
			fs.unlink(file, function (err) {
				if (err) return reject(errors(30002));
				resolve(self);
			});
		});
	},
	getAssetName: function (type) {
		return this.id + config.assets[type].ext;
	},
	getAssetPath: function (type) {
		return path.join(config.assets[type].dir, this.getAssetName(type));
	}
});

syModel.Set = syCollection.include({
	model: syModel,

	initialize: function () {
		syCollection.__super__.initialize.apply(this, arguments);
		this._data = {};
		var self = this;
		[
			'fetching', 'fetched'
		].forEach(function (k) {
				self.on(k, self[k], self);
			});
	},

	fetching: function () {
		return Promise.cast();
	},
	fetch: function (options) {
		options = options || {};
		var req = options['req'];
		if (req) {
			var limit = req.query['limit'], self = this;
			this.query(function (qb) {
				if (options['self']) {
					if (self.models.length < 1) {
						limit = 0;
					} else {
						qb.whereIn('id', _.pluck(self.models, 'id'));
					}
				}
				if (self.lister) self.lister(req, qb);
			}).query(function (qb) {
					req.query['orders'].forEach(function (order) {
						qb.orderBy(order[0], order[1]);
					});
					qb.offset(req.query['offset']);
					// empty list for empty fuzzy query
					if (req.query['fuzzy'] && req.query['applied'] < 1) limit = 0;
					qb.limit(limit);
				});
		}
		return syCollection.__super__.fetch.call(this, options);
	},
	fetched: function (obj, resp, options) {
		var p = Promise.cast(obj);
		// for collection
		if (obj instanceof syCollection) {
			return p.return(obj.models)
				.map(function (model) {
					return model.triggerThen('fetched',
						model, model.attributes, options);
				});
		}
		return p;
	},

	lister: null,
	allowNull: function (query, keys) {
		keys.forEach(function (k) {
			if (!query[k]) query[k] = null;
		});
		return this;
	},
	qbWhere: function (qb, req, query, keys, tbname) {
		var prefix = !tbname ? '' : tbname + '.';
		keys.forEach(function (k) {
			if (k in query) {
				var column = prefix + k;
				if (_.isArray(query[k])) {
					if (query[k].length < 1) {
						req.query['limit'] = 0;
					} else {
						qb.whereIn(column, query[k]);
					}
				} else {
					qb.where(column, query[k]);
				}
				req.query['applied']++;
			}
		});
		return this;
	},
	qbWhereLike: function (qb, req, query, keys, tbname) {
		var prefix = !tbname ? '' : tbname + '.';
		keys.forEach(function (k) {
			if (k in query) {
				var column = prefix + k;
				if (query[k] == null) query[k] = '';
				qb.where(column, 'like', '%' + query[k] + '%');
				req.query['applied']++;
			}
		});
		return this;
	}
});

// common
[syModel, syCollection].forEach(function (s) {
	s.include({
		// like jQuery .data api
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
		}
	});
});
