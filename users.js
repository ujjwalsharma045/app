module.exports = function(app , func , mail, upload, storage, mailer, multer, validator, ObjectID, URL, MongoClient){
    
	app.get("/" , function(req , res){
		if(req.cookies.user===undefined){
			  //func.isGuestSession(req.session , res);
			  func.isGuestSession(req.session , res);
			  res.render('users/add' , {
				 errors:"",
				 data:{}
			  });
		}
		else {
			 req.session.isLoggedIn =1;
			 res.redirect("../showusers");
		}
    });

	app.get("/login" , function(req , res){
		func.isLoggedIn(req.session , res);
		res.render('users/login' , {
			errors:"",
			data:{}
		});
	});

	app.post("/login" , function(req , res){
		func.isLoggedIn(req.session , res);
		var error = [];
		var sess = req.session;
		if(req.method=="POST"){
			console.log(req.body.username);
			var data = {
				username:req.body.username.trim()
				//password:req.body.password
			}
			
			if(!validator.trim(req.body.username)){
				error.push("Enter Username");
			}
			
			if(!validator.trim(req.body.password)){
				//error.push("Enter Password");
			}
			
			if(error.length>0){
				res.render("users/login" , {
				   errors:error,
				   data:data			   
				});
			}
			else {
				MongoClient.connect(URL, function(err, db){
					if(err){
						 console.log(err); 	
					}
					else {
						 db.collection("user").find(data).toArray(function(err, user){
							   console.log(user);
							   if(user.length>0){	
								   sess.isLoggedIn =1;  
								   sess.first_name=user.first_name;
								   
								   var detail = {
									   maxAge:900000,
									   httpOnly:true
								   };
								   
								   res.cookie('user' , 'rakesh' , detail);
								   res.redirect("../showusers");
							   }
							   else {
								   error.push("Either username or password is incorrect.");
								   res.render("users/login" , {
									   errors:error,
									   data:data
								   }); 					   
							   }
						});
					}
				});				
			}
		}
		else {
			res.render('users/login' , {
				errors:"",
				data:{}
			});
		}
	});

	app.post("/adduser" , upload , function(req , res){
		sess=req.session;	
		//func.isGuestSession(req.session , res);
		var error = [];
		var data = {};
		if(req.method=="POST"){
			 data = {
				first_name:req.body.first_name,
				last_name:req.body.last_name,
				email:req.body.email,
				username:req.body.username,
				password:req.body.password,
				address:req.body.address,
				city:req.body.city,
				state:req.body.state,
				zipcode:req.body.zipcode			
			 }
			
			 if(!validator.trim(req.body.first_name)){
				error.push("Enter First Name");
			 }

			 if(!validator.trim(req.body.last_name)){
				error.push("Enter Last Name");
			 }
			
			 if(!validator.trim(req.body.email)){
				error.push("Enter Email");
			 }

			 if(!validator.trim(req.body.username)){
				error.push("Enter User Name");
			 }
			
			 if(!validator.trim(req.body.password)){
				error.push("Enter Password");
			 }
			
			 if(!validator.trim(req.body.address)){
				error.push("Enter Address");
			 }
			
			 if(!validator.trim(req.body.city)){
				error.push("Enter City");
			 }
			
			 if(!validator.trim(req.body.state)){
				error.push("Enter State");
			 }			
												
			 if(error.length>0){
				res.render('users/add', {
					 errors:error,
					 data:data				 
				});
			 }
			 else {
				var fileDetail = upload(req, res, function(err){
					if(err){
						res.end(err);
						return; l
					}
				});
				
				data.profile_pic = req.file.myprofile;
				MongoClient.connect(URL, function(err, db){
				  if(err){
					  console.log(err);	  
				  }
				  else {
					  var collection = db.collection('user');
					  collection.insert(data , function(err , records){
						  
						  mailoptions = {
							  to:data.email,
							  subject: "User Registration",
							  text:"User Registered successfully"
						  };
						  
						  var mailObj = mail.configMail(mailer);
						  
						  mailObj.sendMail(mailoptions, function(error , response){
							  if(error){
								  console.log(error); 
							  }
							  else {
								  console.log(response.message); 
							  }
						  });
					  });
				  }
			   });
			   
			   sess.flashmessage = "User detail saved successfully";
			   res.redirect("../showusers");		   
			}
		}
		
		res.render('users/add' , {
			errors:"",
			data :data
		});
	});

	app.get("/showusers" , function(req, res){
		sess=req.session;
		//req.session.flashmessage = "";
		func.isGuestSession(req.session , res);
		MongoClient.connect(URL, function(err, db){
			  if(err){
				 console.log(err);	  
			  }
			  else {
				 var collection = db.collection('user');
				 collection.find().toArray(function(err, docs){
					console.log("retrieved records:");
					console.log(docs);
					res.render("users/users" , {
					   users:docs,
					   usersession:sess 				   
					});
				 });               			
			  }
		});    	 
	});

	app.get("/delete/:id" , function(req, res){
		sess=req.session;	
		func.isGuestSession(req.session , res);
		var userid = req.params.id; 
		
		MongoClient.connect(URL, function(err, db){
			  if(err){
				 console.log(err);	  
			  }
			  else {
				  var collection = db.collection('user');
				  collection.remove({_id:ObjectID(userid)}, function(err, result){
						  if(err){
							 console.log("Error"+err);                
						  }
						  else{                
							 console.log("Removed"+userid+result);
						  }
				  });			 
				  sess.flashmessage = "User deleted successfully";
				  res.redirect("../showusers");			 
			  }
		});    	 
	});

	app.get("/view/:id" , function(req, res){
		func.isGuestSession(req.session , res);
		var userid = req.params.id; 
		MongoClient.connect(URL, function(err, db){
			  if(err){
				 console.log(err);	  
			  }
			  else {
				 var collection = db.collection('user');
				 collection.find({_id:ObjectID(userid)}).toArray(function(err, records){
					console.log("retrieved records:");
					console.log(records);
					res.render("users/views" , {
					   records:records
					});
				 });               			
			  }
		});    	 
	});

	app.get("/edit/:id" , function(req, res){

		func.isGuestSession(req.session , res);
		var userid = req.params.id; 
		var error = [];
		var data = {};
		MongoClient.connect(URL, function(err, db){
			  if(err){
				 console.log(err);	  
			  }
			  else {
				 var collection = db.collection('user'); 
				 collection.find({_id:ObjectID(userid)}).toArray(function(err, records){
					console.log("retrieved records:");
					console.log(records);
					res.render("users/edit" , {
					   users:records,
					   id:userid,
					   errors:error,
					   data:data
					   
					});
				 });               			
			  }
		});		 
	});

	app.post("/edit/:id" , function(req, res){
		sess=req.session;	
		func.isGuestSession(req.session , res);
		var userid = req.params.id; 
		var error = [];
		var data = {};
		var recor = [];
		MongoClient.connect(URL, function(err, db){
			  if(err){
				 console.log(err);	  
			  }
			  else {
				 var collection = db.collection('user'); 
				 collection.find({_id:ObjectID(userid)}).toArray(function(err, records){
					recor = records;
				 });               			
			  }
		});
			
		if(req.method=="POST"){
			 
			 data = {
				first_name: req.body.first_name,
				last_name:req.body.last_name,
				email:req.body.email,
				password:req.body.password,
				address:req.body.address,
				city:req.body.city,
				state:req.body.state,
				zipcode:req.body.zipcode   		   
			 };
			 
			 if(!validator.trim(req.body.first_name)){
				 error.push("Enter First Name");
			 }
			 
			 if(!validator.trim(req.body.last_name)){
				 error.push("Enter Last Name");
			 }
			 
			 if(!validator.trim(req.body.email)){
				 error.push("Enter Email");
			 }
			 
			 if(!validator.trim(req.body.username)){
				 error.push("Enter User Name");
			 }
			 
			 if(!validator.trim(req.body.password)){
				 error.push("Enter Password");
			 }
			 
			 if(!validator.trim(req.body.address)){
				 error.push("Enter Address");
			 }
			 
			 if(!validator.trim(req.body.city)){
				 error.push("Enter City");
			 }
			 
			 if(!validator.trim(req.body.state)){
				 error.push("Enter State");
			 }		 
			 
			 if(error.length >0){
				  res.render("users/edit" , {
					  errors:error,
					  users:recor,
					  id:userid,
					  users:recor
				  });  
			 }
			 else {
				  MongoClient.connect(URL, function(err, db){
					  if(err){
							console.log(err);	  
					  }
					  else {
							var collection = db.collection('user'); 
							  collection.updateOne({
							   _id:ObjectID(userid)} , {
							   $set:data
							  } , function(err, records){	
							
							});               			
					  }
				  });
				  
				  sess.flashmessage = "User detail updated successfully.";
				  res.redirect("../showusers");			 
			 } 		 		 	
		}    	
	});

    app.get("/contact" , contactForm);
    app.post("/contact" , contactForm);

	function contactForm(req, res){
		var sess = req.session;
		var errors = [];
		var postdata = {};
		if(req.method=="POST"){
			
			postdata = {
				name:req.body.name,
				email:req.body.email,
				message:req.body.message
			};
			
			if(!validator.trim(req.body.name)){
				errors.push("Enter Your Name");
			}
			
			if(!validator.trim(req.body.email)){
				errors.push("Enter Your Email");	
			}
			else if(!validator.isEmail(req.body.email.trim())){
				errors.push("Enter Valid Email");	
			}
			
			if(!validator.trim(req.body.message)){
				errors.push("Enter Your Message");	
			} 
			
			if(errors.length<=0){
				  var mailObj = mail.configMail(mailer);
				  
				  mailoptions = {
					  to:app.get('adminemail'),
					  subject:"Contact Query",
					  text:"Hi Admin,</br>"+req.body.name+" has sent an inquiry</br>"+req.body.message+"</br>Thanks"
				  },
				  
				  mailObj.sendMail(mailoptions, function(error , response){
					  if(error){
						  console.log(error); 
					  }
					  else {
						 
					  }
				  });
				  
				  sess.flashmessage = "Your message sent successfully";
				  res.redirect("../contact");
			}
		}
		
		res.render("users/contact" , {
			errors:errors,
			usersession:sess,
			postdata:postdata
		});
    }
}
