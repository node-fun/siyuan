/**
 * Created by cin on 2/26/14.
 */
var fs = require('fs-extra'),
	path = require('path'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	Promise = require('bluebird'),
	config = require('../config'),
	tbPicture = 'pictures';

Picture = module.exports = syBookshelf.Model.extend({
	tableName: tbPicture,
	fields: ['id', 'issueid'],
	fieldToAssets: { avatar: 'pictures'},

	saving: function () {
		return Picture.__super__
			.saving.apply(this, arguments);
	},
	issue: function () {
		return this.belongsTo(require('./issue'), 'issueid')
	},

	updatePicture: function (field, tmp) {
		var self = this;
		return self.related('issue').fetch().then(function (issue) {
				var posttime = issue.get('posttime'),
					type = self.fieldToAssets[field],
					file = self.getPicturePath(type, posttime);
			return new Promise(
				function (resolve, reject) {
					fs.mkdirp(path.dirname(file), function (err) {
						if (err) return reject(errors[30000]);
						fs.copy(tmp, file, function (err) {
							if (err) return reject(errors[30003]);
							resolve(self);
						});
					});
				}).catch(function (err) {
					return self;
				})
		});
	},

	getPicturePath: function (type, timestamp) {
		var date = new Date(timestamp),
			folder = (parseInt(date.getFullYear()) % 100) + '/' + (parseInt(date.getMonth()) + 1);
		return path.join(config.assets[type].dir + '/' + folder, this.getAssetName(type));
	}
});

Pictures = Picture.Set = syBookshelf.Collection.extend({
	model: Picture
});