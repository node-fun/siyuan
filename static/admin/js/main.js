URL={};
URL.root = 'http://' + location.host + '/';
function loadUserTable(page, func){
	var url = URL.root+'api/users/find?limit=7';
	if(page){
		url += '&page='+page;
	}
	$.ajax( url,
		{
			success: function(data){
				var users = data['users'];
				if(!users.length)return;
				var str = '';
				for(var i=0; i<users.length; i++ ){
					str += '<tr>'
						+ '<td>'+ users[i]['id'] +'</td>'
						+ '<td>'+ users[i]['username'] +'</td>'
						+ '<td>'+ users[i]['profile']['nickname'] +'</td>'
						+ '<td>'+ users[i]['profile']['name'] +'</td>'
						+ '<td>'+ users[i]['profile']['gender'] +'</td>'
						+ '<td>'+ users[i]['profile']['age'] +'</td>'
						+ '<td>'+ users[i]['profile']['grade'] +'</td>'
						+ '<td>'+ users[i]['profile']['university'] +'</td>'
						+ '<td>'+ users[i]['profile']['major'] +'</td>'
						+ '<td>'+ new Date(users[i]['regtime']).format("yyyy-MM-dd hh:mm:ss") +'</td>'
						+ '<td>'+ users[i]['isonline'] +'</td>'
						+ '<td>'+ users[i]['numFriends'] +'</td>'
						+ '<td>'+ users[i]['numIssues'] +'</td>'
						+ '</tr>';
				}
				$('#usertable>tbody').html(str);
				func(5);//参数：总页数，后面林亮会传过来
			}
		}
	);
}

function loadPager(containerId, minPage, maxPage, activePage){
	minPage&&minPage>0?minPage:minPage=1;//页码都从1开始
	maxPage?maxPage:maxPage=10;
	activePage?activePage:activePage=1;
	activePage = parseInt(activePage);
	loadUserTable(activePage, function(maxpage){//传回来的是真正存在的最大页码
		if(maxpage<maxPage){
			maxPage = maxpage;
		}
		var pager = $('<ul>').addClass('pure-paginator');
		var pagerPrev = $('<li>').addClass('pure-button prev').text('<'),
			pagerNext = $('<li>').addClass('pure-button next').text('>');
		pagerPrev.on('click', function(){
			if(minPage>1 && activePage==minPage){
				loadPager(containerId, minPage-1, maxPage-1, activePage-1);
			}else{
				loadPager(containerId, minPage, maxPage, activePage-1);
			}
		});
		pagerNext.on('click', function(){
			if(activePage==maxPage){
				loadPager(containerId, minPage+1, maxPage+1, activePage+1);
			}else{
				loadPager(containerId, minPage, maxPage, activePage+1);
			}
		});
		pager.append(pagerPrev).append(pagerNext);
		for(var i=minPage; i<=maxPage; i++){
			var p = $('<li>').addClass('pure-button').text(i).on('click', function(){
				loadPager(containerId, minPage, maxPage, $(this).text());
			});
			if(activePage == i){
				p.addClass('pure-button-active');
			}
			pagerNext.before(p);
		}
		$(containerId).html(pager);
	});
	
}

// 对Date的扩展，将 Date 转化为指定格式的String   
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
// 例子：   
// (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
// (new Date()).format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
Date.prototype.format = function(fmt)
{ //author: meizz   
	var o = {
		"M+" : this.getMonth()+1,                 //月份   
		"d+" : this.getDate(),                    //日   
		"h+" : this.getHours(),                   //小时   
		"m+" : this.getMinutes(),                 //分   
		"s+" : this.getSeconds(),                 //秒   
		"q+" : Math.floor((this.getMonth()+3)/3), //季度   
		"S"  : this.getMilliseconds()             //毫秒   
	};
	if(/(y+)/.test(fmt))
		fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	for(var k in o)
		if(new RegExp("("+ k +")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
	return fmt;
}

function loadUserList(){
	$.ajax({
		url: URL.root+'admin/list_user.html',
		success: function(data){
			$('#content').html(data);
			loadPager('#pager',1,10,1);
		}
	});
}

function load(file){
	$.ajax({
		url: URL.root+'admin/'+file,
		success: function(data){
			$('#content').html(data);
		}
	});
}
