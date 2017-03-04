module.exports = function(app , func , mail, upload, storage, mailer, multer, validator, Services, paginate){
	
	app.get("/services/" , servicelist);
	app.get("/services/view/:id" , serviceview);
	app.get("/services/add" , serviceadd);
	app.post("/services/add" , serviceadd);
	app.get("/services/edit/:id" , serviceedit);
	app.post("/services/edit/:id" , serviceedit);
	app.get("/services/delete/:id" , servicedelete);
	
	function servicelist(req, res){
		var sess = req.session;
				
	    /*Services.find({}, function(err, services) {
			  if (err) throw err;
			  console.log(services); 
              res.render("services/index" , {
				 services:services,
				 session:sess
			  });			 
        });*/

		var data = {
			
		};
				
		if(req.query.title && validator.trim(req.query.title.trim())){			
		    var searchtitle = req.query.title.trim();
		   	data.title = searchtitle;
		}
		
		if(req.query.price && validator.trim(req.query.price.trim())){			
		    var searchprice = req.query.price.trim();
		   	data.price = searchprice;
		}
		
		if(req.query.cost && validator.trim(req.query.cost.trim())){			
		    var searchcost = req.query.cost.trim();
		   	data.cost = searchcost;
		}
		
		if(req.query.limit){
		  perPage = req.query.limit;	
		}
		else {
		  perPage = 1;	
		}
        
        page =  req.query.page > 0 ? req.query.page:1;
		
        Services.find(data).limit(perPage).skip(perPage * (page-1)).sort({'title': 'asc'}).exec(function(err, services){
			  console.log(services);			   
			  Services.count().exec(function (err, count) {	
                    console.log(count);			  
					res.render("services/index" , {
				        services:services,
				        session:sess,
						pages: count/perPage,
						count: count,
						pagelimit:perPage,
						currentpage:page
			        });	 
			  });
		});		
	}

    function serviceview(req, res){
		var sess = req.session;
		var serviceid = req.params.id;
		
		Services.find({_id:serviceid}, function(err, services) {
			  if (err) throw err;
			  console.log(services); 
              res.render("services/view" , {
				service:services,
				session:sess
			  });			  			 			  
        }); 
	}
	
	function servicedelete(req, res){
		var sess = req.session;
		var serviceid = req.params.id;
								
		Services.findOneAndRemove({ _id: serviceid }, function(err) {
            if (err) throw err;            
            console.log('Service successfully deleted!');
			res.redirect("../");
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
                data = {
					   title:req.body.title.trim(),
					   description:req.body.description.trim(),
					   price:req.body.price.trim(),
					   cost:req.body.cost.trim(),
					   status:req.body.status.trim()			  
		        };
				
				var detail = new Services(data);
				
				detail.save(function(err){
				      if(err) throw err;
				      console.log('Service saved successfully!');
					  res.redirect('../services');
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
		      
			  var data = {
				   title:req.body.title.trim(),
				   description:req.body.description.trim(),
				   price:req.body.price.trim(),
				   cost:req.body.cost.trim(),
				   status:req.body.status.trim()			  
		      };
					 
              Services.findOneAndUpdate({ _id: serviceid }, data, function(err, services) {
				  if (err) throw err;				 
				  console.log(services);
				  res.redirect("../");
               });               			 
		    }
		 }
        		
         Services.find({_id:serviceid}, function(err, services) {
			  if (err) throw err;
			  console.log(services);               
              res.render("services/edit" , {
				 service:services,
				 id:serviceid,		   
				 errors:error   	
			  });			  
        }); 		       	
	}    
}