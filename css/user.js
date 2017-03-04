module.exports = function(app , func , mail, upload, storage, mailer, multer, validator, User, paginate){
    
	app.get("/adduser" , function(req , res){					 
		func.isGuestSession(req.session , res);
		res.render('users/add' , {
			errors:"",
			data:{}
		});		
    });

	app.get("/login" , function(req , res){
		func.isLoggedIn(req.session , res);
		if(req.cookies.user===undefined){				
			res.render('users/login' , {
				errors:"",
				data:{}
			});
		}
		else {
			req.session.isLoggedIn =1;
			res.redirect("../showusers");
		}
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
			
                User.find(data, function(err, user) {
					  if (err) throw err;
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
		func.isGuestSession(req.session , res);
		var error = [];
		var data = {};
		if(req.method=="POST"){
			 data = {
				first_name:req.body.first_name.trim(),
				last_name:req.body.last_name.trim(),
				email:req.body.email.trim(),
				username:req.body.username.trim(),
				password:req.body.password.trim(),
				address:req.body.address.trim(),
				city:req.body.city.trim(),
				state:req.body.state.trim(),
				zipcode:req.body.zip_code.trim()			
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
							   
			    var detail = new User(data);
			    detail.save(function(err){
				   if(err) throw err;
				   console.log('User saved successfully!');
				   
				   mailoptions = {
					  to:data.email,
					  subject: "User Registration",
					  text:"User Registered successfully"
				   };
				   
				   var mailObj = mail.configMail(mailer);
				  
				   mailObj.sendMail(mailoptions, function(error , response){
					  if(error){
						  throw err;
					  }
					  else {
						  console.log(response.message); 
					  }
				   });				  
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
		//func.isGuestSession(req.session , res);
        /*User.find({}), function(err, docs) {
			  if (err) throw err;
			  console.log(docs); 
              res.render("users/users" , {
				 users:docs,
				 usersession:sess
			  });			 
        });*/ 
		var data = {
			
		};
				
		if(req.query.email && validator.trim(req.query.email.trim())){			
		    var searchemail = req.query.email.trim();
		   	data.email = searchemail;
		}
		
		if(req.query.first_name && validator.trim(req.query.first_name.trim())){			
		    var searchfname = req.query.first_name.trim();
		   	data.first_name = searchfname;
		}
		
		if(req.query.last_name && validator.trim(req.query.last_name.trim())){			
		    var searchlname = req.query.last_name.trim();
		   	data.last_name = searchlname;
		}
		
		if(req.query.limit){
		  perPage = req.query.limit;	
		}
		else {
		  perPage = 1;	
		}
        
        page =  req.query.page > 0 ? req.query.page:1;
        //console.log(data);
        User.find(data).limit(perPage).skip(perPage * (page-1)).sort({'first_name': 'asc'}).exec(function(err, docs){
			  console.log(docs);			   
			  User.count().exec(function (err, count) {	
                    console.log(count);			  
					res.render("users/users" , {
				        users:docs,
				        usersession:sess,
						pages: count/perPage,
						count: count,
						pagelimit:perPage,
						currentpage:page
			        });	 
			  });
		});
	});

	app.get("/delete/:id" , function(req, res){
		sess=req.session;	
		func.isGuestSession(req.session , res);
		var userid = req.params.id; 
				
        User.findOneAndRemove({_id: userid}, function(err) {
            if (err) throw err;            
            console.log('User successfully deleted!');
			res.redirect("../");
        });		
	});

	app.get("/view/:id" , function(req, res){
		func.isGuestSession(req.session , res);
		var userid = req.params.id; 		

        User.find({_id:userid}, function(err, records) {
			  if (err) throw err;
			  console.log(records); 
              res.render("users/views" , {
				records:records
			  });			  			 			  
        }); 		
	});

	app.get("/edit/:id" , function(req, res){

		func.isGuestSession(req.session , res);
		var userid = req.params.id; 
		var error = [];
		var data = {};		

        User.find({_id:userid}, function(err, records) {
			  if (err) throw err;
			  console.log(records); 
              
              res.render("users/edit" , {
				 users:records,
				 id:userid,
				 errors:error,
				 data:data					  
			  });			  
        }); 		
	});

	app.post("/edit/:id" , function(req, res){
		sess=req.session;	
		func.isGuestSession(req.session , res);
		var userid = req.params.id; 
		var error = [];
		var data = {};
		var recor = [];				
			
		if(req.method=="POST"){
			 			 			 
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

             if(!validator.trim(req.body.zip_code)){
				 error.push("Enter Zipcode");
			 }			 
			 
			 if(error.length <=0){
                  data = {
						first_name: req.body.first_name.trim(),
						last_name:req.body.last_name.trim(),
						email:req.body.email.trim(),
						password:req.body.password.trim(),
						address:req.body.address.trim(),
						city:req.body.city.trim(),
						state:req.body.state.trim(),
						zipcode:req.body.zip_code.trim()   		   
			      }; 				 
				  User.findOneAndUpdate({ _id: userid }, data, function(err, records) {
					  if (err) throw err;				 
					  console.log(records);					 
                  });
				  
				  sess.flashmessage = "User detail updated successfully.";
				  res.redirect("../showusers");			 
			 } 		 		 	
		}

        User.find({_id:userid}, function(err, records) {
			  if (err) throw err;
			  console.log(records); 
			  res.render("users/edit" , {
				 errors:error,
				 users:records,
				 id:userid					 
			  });		  
        });      	
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
