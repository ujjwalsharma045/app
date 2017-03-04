var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.set('adminemail' , 'watermark0913@gmail.com');
app.set('view engine' , 'ejs');
app.use(cookieParser());
app.use(session({
   secret:"dfdfxg",
   resave:true,
   saveUninitialized:true
}));

//var urlencodedParser = bodyParser.urlencoded({extended:false});

var MongoClient = require('mongodb').MongoClient;
var URL = 'mongodb://localhost:27017/mydatabase';

MongoClient.connect(URL, function(err, db) {
	if(err){
		 console.log(err);	  
	}
	else {
		  /*var collection = db.collection('user');
		  collection.find().toArray(function(err, docs){
			  console.log(docs[0])
			  //db.close()
		  });*/
		  
		  /* collection.insert({name: 'taco', tasty: true}, function(err, result) {
			collection.find({name: 'taco'}).toArray(function(err, docs) {
			  console.log(docs[0])
			  db.close()
			})
		  }); */
		  return db; 
	}
});

var ObjectID = require("mongodb").ObjectID;

var validator = require('validator');
var multer = require('multer');

var mailer = require('nodemailer');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads')
	},
	filename: function (req, file, cb) {
		var fileexploded = file.originalname.split(".");
		var extension = fileexploded[fileexploded.length-1];
		cb(null, file.fieldname + '-' + Date.now()+"."+extension)
	}
});

var upload = multer({storage:storage}).single('myprofile');

var func = require("./commonfunctions.js");

var mail = require("./mailfunctions.js");

require('./users')(app , func , mail, upload, storage, mailer, multer, validator, ObjectID, URL, MongoClient);

require('./service')(app , func , mail, upload, storage, mailer, multer, validator, ObjectID, URL, MongoClient);

var server = app.listen(8081 , function(){
    var host = server.address().address;
    var port = server.address().port;
   
    console.log('App listing at http' , host, port);
});