var express = require('express');
var app = express();
var paginate = require('express-paginate');
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
app.use(paginate.middleware(10, 50));
//var urlencodedParser = bodyParser.urlencoded({extended:false});
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mydatabase');

var User = require('./models/user')(mongoose);
var Services = require('./models/service')(mongoose);

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

require('./user')(app , func , mail, upload, storage, mailer, multer, validator, User , paginate);

require('./services')(app , func , mail, upload, storage, mailer, multer, validator, Services , paginate);

var server = app.listen(8081 , function(){
    var host = server.address().address;
    var port = server.address().port;
   
    console.log('App listing at http' , host, port);
});