var express = require('express');
var app = express();

 // app.use(function(req, res, next) {
 //    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
 //    res.setHeader('Expires', '-1');
 //    res.setHeader('Pragma', 'no-cache');
 //    return next();
 //  });
 app.use(express.static(__dirname + '/public'));

app.listen(process.env.PORT || 3000, function(){
	console.log('server is listening to serve static content..');
});


var mongo = require('mongodb').MongoClient,
	client = require('socket.io').listen(8080).sockets;

mongo.connect('mongodb://127.0.0.1/chat',function(err,db){

	if(err) throw err;
	client.on('connection',function(socket){
		
		var col = db.collection('messages'),
			sendStatus = function(s){
				socket.emit('status',s);
			};

		//Emit all messages
		col.find().limit(100).sort({_id: 1}).toArray(function(err, res){
			if(err) throw err;
			socket.emit('output',res);
		});

		socket.on('input',function(data){
			var name = data.name,
				message = data.message,
				whitespace = /^\s*$/;
		if(whitespace.test(name) || whitespace.test(message)){
			sendStatus('name and messsage is required.');
		}else{
			col.insert({name: name, message: message}, function(){

				//Emit latest messages to all clients
				client.emit('output',[data]);

				sendStatus({
					message : "message sent",
					clear : true
				});
			});
		}
		});
	});
});

