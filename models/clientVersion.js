/**
 * Created by Cam on 14-2-6.
 */
var syBookshelf = require('./base'),
	ClientVersion, ClientVersions;

ClientVersion = module.exports = syBookshelf.Model.extend({
	tableName: 'client_versions',
	fields: [
		'id', 'versioncode', 'versionname', 'description', 'comment', 'posttime'
	],
	defaults: function () {
		return {
			posttime: new Date()
		};
	}
});

ClientVersions = ClientVersion.Set = syBookshelf.Collection.extend({
	model: ClientVersion
});