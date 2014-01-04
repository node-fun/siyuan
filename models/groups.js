/**
 * Created by Cam on 14-1-2.
 */
var _ = require('underscore'),
	chance = new (require('chance'))(),
	errors = require('../lib/errors'),
	syBookshelf = require('./base'),
	Group, Groups;

Group = module.exports = syBookshelf.Model.extend({
	tableName: 'groups',
	fields:[
		'id', 'ownerid', 'name', 'description', 'createtime', 'avatar'
	],
	omitInJSON:['id'],

	saving: function(){
		var ret = Group.__super__
			.saving.apply(this, arguments);
		return ret;
	}
},{
	findGroups: function(){

	},
	createGroup: function(ownerid, name,description, avatar){
		return Group.forge(ownerid, name, description, avatar)
			.save();
	}
});

Groups = Group.Set = syBookshelf.Collection.extend({
	model: Group
});