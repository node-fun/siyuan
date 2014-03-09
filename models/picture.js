/**
 * Created by cin on 2/26/14.
 */
var fs = require('fs-extra'),
	path = require('path'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	Promise = require('bluebird'),
	errors = require('../lib/errors'),
	config = require('../config'),
	tbPicture = 'pictures';

Picture = module.exports = syBookshelf.Model.extend({
	tableName: tbPicture,
	fields: ['id', 'issueid', 'activityid', 'cooperationid', 'path'],
	fieldToAssets: { avatar: 'pictures'},

	saving: function () {
		return Picture.__super__
			.saving.apply(this, arguments);
	},
	issue: function () {
		return this.belongsTo(require('./issue'), 'issueid')
	},
	activity: function () {
		return this.belongsTo(require('./activity'), 'activityid');
	},
	cooperation: function () {
		return this.belongsTo(require('./cooperation'), 'cooperationid');
	},

	updatePicture: function (field, tmp) {
		var self = this, type, timeType;

		if (self.get('activityid')) {
			type = 'activity';
			timeType = 'createtime';
		}
		if (self.get('cooperationid')) {
			type = 'cooperation';
			timeType = 'createtime';
		}
		if (self.get('issueid')) {
			type = 'issue';
			timeType = 'posttime';
		}
		return self.related(type).fetch().then(function (obj) {
				var posttime = obj.get(timeType),
					type = self.fieldToAssets[field],
					date = new Date(posttime),
					folder = (parseInt(date.getFullYear()) % 100) + '/' + (parseInt(date.getMonth()) + 1),
					file = path.join(config.assets[type].dir + '/' + folder, self.getAssetName(type)),
					thePath = '/pictures' + '/' + folder + '/' + self.getAssetName(type);

			return self.set({ path: thePath }).save().then(function () {
				return new Promise(
					function (resolve, reject) {
						fs.mkdirp(path.dirname(file), function (err) {
							if (err) return reject(errors(30000));
							fs.copy(tmp, file, function (err) {
								if (err) return reject(errors(30003));
								resolve(self);
							});
						});
					}).catch(function (err) {
						return self;
					})
			});
		});
	}
});

Pictures = Picture.Set = syBookshelf.Collection.extend({
	model: Picture
});