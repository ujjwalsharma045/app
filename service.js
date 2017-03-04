module.exports = function(app , func , mail, upload, storage, mailer, multer, validator, ObjectID, URL, MongoClient){
	
	app.get("/services/" , servicelist);
	app.get("/services/view/:id" , serviceview);
	app.get("/services/add" , serviceadd);
	app.post("/services/add" , serviceadd);
	app.get("/services/edit/:id" , serviceedit);
	app.post("/services/edit/:id" , serviceedit);
	app.get("/services/delete/:id" , servicedelete);
	
	function servicelist(req, res){
		var sess = req.session;
		
		MongoClient.connect(URL , function(err , db){
			if(err){
				console.log(err);
			}
			else {
				var services = db.collection('service');
				services.find().limit(2).toArray(function(err , docs){
					console.log(docs);
				    res.render("services/index" , {
					   services:docs,
					   session:sess
					});
				});
				
				
				db.collection('service').aggregate(
					  {$match: {user_id: 'user._id'}},
					  { "$lookup": {
							"from": "user",
							"localField": "user_id",
							"foreignField": "_id",
							"as": "user"
                      }},
					  function(err, data){
						if(err){
						  throw err;
						}
						console.log(JSON.stringify(data, undefined, 2));
					  }
               );
			}
		});
	}

    function serviceview(req, res){
		var sess = req.session;
		var userid = req.params.id;
		MongoClient.connect(URL , function(err , db){
			if(err){
				console.log(err);
			}
			else {
				var services = db.collection('service');
				services.find({_id:ObjectID(userid)}).toArray(function(err , docs){
					if(err){
						res.send(err);
					}
					else {
						res.render("services/view" , {
						   service:docs,
						   session:sess
						});
					}
				});
			}
		});
	}
	
	function servicedelete(req, res){
		var sess = req.session;
		var serviceid = req.params.id;
		MongoClient.connect(URL , function(err , db){
			if(err){
				console.log(err);
			}
			else {
				var services = db.collection('service');
				services.remove({_id:ObjectID(serviceid)} , function(err , result){
				    if(err){
						res.send(err);
					}
					else {
				        res.redirect("../");		
					}
				});				
			}
		});
	}
	
	function serviceadd(req, res){
		var sess = req.session;		
		var error = [];
		var data = {};
		if(req.method=="POST"){					   
		   
		   if(!validator.trim(req.body.title)){
			   error.push("Enter Title");
		   }
		   
           if(!validator.trim(req.body.description)){
			   error.push("Enter Description");
		   }
		   
           if(!validator.trim(req.body.price)){
			   error.push("Enter Price");
		   }
		   
           if(!validator.trim(req.body.cost)){
			   error.push("Enter Cost");
		   }
		   
		   if(!validator.trim(req.body.status)){
			   error.push("Select Status");
		   }

           if(error.length<=0){
		      MongoClient.connect(URL , function(err, db){
			     if(err){
					 res.send(err); 
				 }
				 else {
					 data = {
					   title:req.body.title,
					   description:req.body.description,
					   price:req.body.price,
					   cost:req.body.cost,
					   status:req.body.status			  
		             };	
				     var service = db.collection('service');  	
					 service.insert(data , function(err, records){
						 if(err){
							 res.send(err);
						 }
						 else {
							 res.redirect("../services");							
						 }
					 });
				 }				 
			  }); 
		   }
		   else {
			   res.render("services/add" , {
				   service:req.body,	
				   errors:error   	
			   });
		   } 
		}
        else {
			res.render("services/add" , {
			   service:req.body,	
			   errors:error   	
			});
		}
	}

    function serviceedit(req, res){
		var sess = req.session;
		var serviceid = req.params.id;
		var error = [];
		var data = [];
		var servicedata = [];
		
		if(req.method=="POST"){		   			   
		   			   
		   if(!validator.trim(req.body.title)){
			   error.push("Enter Title");
		   }
		   
           if(!validator.trim(req.body.description)){
			   error.push("Enter Description");
		   }
		   
           if(!validator.trim(req.body.price)){
			   error.push("Enter Price");
		   }
		   
           if(!validator.trim(req.body.cost)){
			   error.push("Enter Cost");
		   }
		   
		   if(!validator.trim(req.body.status)){
			   error.push("Select Status");
		   }

           if(error.length<=0){
		      MongoClient.connect(URL , function(err, db){
			     if(err){
					 res.send(err); 
				 }
				 else {
					 var data = {
					   title:req.body.title,
					   description:req.body.description,
					   price:req.body.price,
					   cost:req.body.cost,
					   status:req.body.status			  
		             };
					 
				     var service = db.collection('service');  	
					 service.updateOne({_id:ObjectID(serviceid)}, {$set:data} , function(err, records){
						 if(err){
							 res.send(err);
						 }
						 else {
							 res.redirect("../");
						 }
					 });
				 }				 
			  }); 
		   }
		}
        
		MongoClient.connect(URL , function(err, db){
				 if(err){
					 res.send(err); 
				 }
				 else {
					 var user = db.collection('service');  	
					 user.find({_id:ObjectID(serviceid)}).toArray(function(err, docs){
						 if(err){
							 res.send(err);
						 }
						 else {
							res.render("services/edit" , {
							   service:docs,
							   id:serviceid,		   
							   errors:error   	
							});
						 }
					 });
				 }				 
		});		
       	
	}    
}