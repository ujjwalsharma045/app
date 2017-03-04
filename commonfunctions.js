module.exports = {
	isLoggedIn:function(sess , res){
		if(sess.isLoggedIn && sess.isLoggedIn==1){
			res.redirect("http://127.0.0.1:8081/showusers");
		}
	},	
	isGuestSession:function(sess , res){
		if(!sess.isLoggedIn || sess.isLoggedIn!=1){
			res.redirect("http://127.0.0.1:8081/login");
		}
	},
	destroySession:function(sess , res){
	    sess.destroy(function(err){
			if(err){
				res.end(err);
				return;
			}
			else {
				res.redirect("../");
			}
		});  	
	}
}