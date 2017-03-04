module.exports = function(mongoose){
    var Schema = mongoose.Schema;
	var userSchema = new Schema({
	  first_name: String,
	  last_name: String,
	  email: String,
	  username: { type: String, required: true, unique: true },
	  password: { type: String, required: true },
	  address: String,
	  city: String,
	  state: String,
	  zipcode: String,
	  profile_pic: String,
	  created_at: Date,
	  updated_at: Date
	});
	var User = mongoose.model('User', userSchema);
	return User;
}

