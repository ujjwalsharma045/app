module.exports = {	
	configMail:function(mailer){
	    var smtpMail =  mailer.createTransport({
			service:"Gmail",
			host:"smtp.gmail.com",
			auth:{
				user:"watermark0913@gmail.com",
				pass:"terasuroor007ujjwal"
			}
		});
		
		return smtpMail;
	}
}