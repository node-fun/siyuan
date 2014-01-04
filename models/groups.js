/**
 * Created by Cam on 14-1-2.
 */
var syBookshelf = require('./base'),
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
	/**
	 * 创建圈子
	 * 创建的时候要在group_members里面加一条记录
	 * @param ownerid
	 * @param name
	 * @param description
	 * @param avatar
	 * @returns {Session|*}
	 */
	createGroup: function(ownerid, name,description, avatar){
		return Group.forge(ownerid, name, description, avatar)
			.save();
	},
	//加入圈子
	join: function(){

	}
});

Groups = Group.Set = syBookshelf.Collection.extend({
	model: Group
});