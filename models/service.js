module.exports = function(mongoose){
	var Schema = mongoose.Schema;
	var serviceSchema = new Schema({
	  title: String,
	  description: String,
	  price: String,
	  cost: String,
	  status: String,
	});
	var Services = mongoose.model('Services', serviceSchema);
	return Services;
}

