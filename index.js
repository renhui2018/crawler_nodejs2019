var request = require('request');
var cheerio = require('cheerio');


function videocrawler(url,callback){
       //获取页面
    request(url,function(err,res){
        if(err){
            callback(err);
        }
        
        var $ = cheerio.load(res.body.toString()); //利用cheerio对页面进行解析

        var videoList = [];
        
        $('.video li a').each(function(){
            var $title = $(this).parent().parent().parent().text().trim();
            var title = $title.split('\n');
            var text = $(this).text().trim();
            text = text.split('\n');
            //console.log(text);
            var time = text[1].match(/\((\d+\:\d+)\)/); 
            var item={
                title : title[0],
                url : 'http://www.imooc.com'+$(this).attr('href'),
                name : text[0],
                duration : time[1]
            };
            var s = item.url.match(/video\/(\d+)/);
            //console.log(s);
            if(Array.isArray(s)){
                item.id = s[1];
                videoList.push(item);
            }
        });
            
        callback(null,videoList);
    });
}


function insertToDB(list){
	var MongoClient = require('mongodb').MongoClient;
	var DB_CONN_STR = 'mongodb://localhost:27017/db1';

	var insertData = function(db, callback) { 
	//连接到表 
		var collection = db.collection('db1_table');
		//插入数据
		var data = [{"name":'wilson001',"age":21},{"name":'wilson002',"age":22}];
		collection.insertMany(list, function(err, result) { 
		if(err)
		{
		    console.log('Error:'+ err);
		    return;
		} 
		    callback(result);
		});
	}

	MongoClient.connect(DB_CONN_STR, function(err, client) {
		console.log("连接成功！");
		var db = client.db("db1")
		insertData(db, function(result) {
			
			console.log(result);
			client.close();
	   });
	});
	
}

var url = 'http://www.imooc.com/learn/857';
videocrawler(url,function(err,videoList){
       if(err){
           return console.log(err);
       }
       console.log(videoList);
	   insertToDB(videoList)
});
