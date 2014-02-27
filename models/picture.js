/**
 * Created by cin on 2/26/14.
 */
var fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	chance = new (require('chance'))(),
	syBookshelf = require('./base'),
	config = require('../config'),
	tbPicture = 'pictures';

Picture = module.exports = syBookshelf.Model.extend({
	tableName: tbPicture,
	fields: ['id', 'issueid'],
	appended: ['issue'],
	fieldToAssets: { avatar: 'pictures'},

	saving: function () {
		return Picture.__super__
			.saving.apply(this, arguments);
	},

	issue: function () {
		return this.belongsTo(require('./issue'), 'issueid')
	},

	updatePicture: function (field, tmp) {
		var type = this.fieldToAssets[field],
			posttime = this.related('issue').get('posttime'),
			file = this.getPicturePath(type, posttime),
			self = this;

		return new Promise(
			function (resolve, reject) {
				fs.mkdirp(path.dirname(file), function (err) {
					if (err) return reject(errors[30000]);
					fs.copy(tmp, file, function (err) {
						if (err) return reject(errors[30003]);
						resolve(self);
					})
				})
			}).then(function () {
				return self.set('issueid', self.get('id')).save();
			}).catch(function (err) {
				return self.set()
			})



	},

	getPicturePath: function (type, timestamp) {
		var date = new Date(timestamp),
			folder = (date.getFullYear() % 100) + '/' + (date.getMonth() + 1);
		return path.join(config.assets[type].dir + '/' + folder, this.getAssetName(type));
	}
});

Pictures = Picture.Set = syBookshelf.Collection.extend({
	model: Picture
});