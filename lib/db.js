var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var placemarks = new Schema({
	name : { type : String, required : true },
	address : { type : String, required : true },
	latitude : { type : Number, required : true },
	longitude : { type : Number, required : true },
	description : { type : String, default: "" },
	tag : [{ type: String }],
	img : [{ url: { type: String }, remark : { type: String } }],
	blog : [{ url: { type: String }, title : { type: String } }],
	checker : { type: Schema.Types.ObjectId, ref:'users', required: true },
	builder : { type: Schema.Types.ObjectId, ref:'users', required: true },
	createTime : { type : Date, default : Date.now }
});

var tagHistory = new Schema({
	tag : { type : String, required : true },
	placemark : { type : Schema.Types.ObjectId, ref:'placemarks', required : true },
	isAdd : { type : Boolean, required : true },
	checker : { type: Schema.Types.ObjectId, ref:'users', required: true },
	builder : { type: Schema.Types.ObjectId, ref:'users', required: true },
	createTime : { type : Date, default : Date.now } 
});

var users = new Schema({
	name : { type : String, required : true, unique : true },
	accountKey : { type : String, required : true, unique : true },
	accountKind : { type : Number, default : 0 }, 		// Special = 0, Facebook = 1, Google+ = 2
	authLevel : { type : Number, required : true }, 	// Programer = 0, Manager = 1, Member = 2, Visitor = 3
	savedPlacemark : { type: Schema.Types.ObjectId, ref:'placemarks' },
	createTime : { type : Date, default : Date.now }
});

mongoose.model('placemarks', placemarks);
mongoose.model('tagHistory', tagHistory);
mongoose.model('users', users);

mongoose.connect('mongodb://localhost:27017/PilgrimageMapDB');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Conncet database fail.'));
db.once('open', function callback() {
	console.log("Connect database success.");
});