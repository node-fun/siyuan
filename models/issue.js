var syBookshelf = require('./base'),
	fkUser = 'userid',
	Issue, Issues;

Issue = module.exports = syBookshelf.Model.extend({
	tableName: 'issues',
	fields: [
		'id', fkUser, 'title', 'body', 'posttime'
	]


}, {

});

Issues = Issue.Set = syBookshelf.Collection.extend({
	model: Issue
});
