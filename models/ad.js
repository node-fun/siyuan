/**
 * Created by Cam on 14-1-24.
 * APP上方的滚动广告
 */
var syBookshelf = require('./base'),
	fkAdmin = 'adminid',
	Ad, Ads;

Ad = module.exports = syBookshelf.Model.extend({
	tableName: 'ad',
	fields: [
		'id', 'title', 'content', 'picture', 'posttime', 'adminid', 'isoutofdate'
	],
	defaults: function () {
		return {
			posttime: new Date(),
			isoutofdate: false
		};
	},
	admin: function () {
		return this.belongsTo(require('./admin'), fkAdmin);
	}
});

Ads = Ad.Set = syBookshelf.Collection.extend({
	model: Ad
});