var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var works = new Schema({
	c_name : { type : String, required : true},
	j_name : { type : String, required : true},
	introduction : { type : String, default : "" },
	imgUrl : { type: String, default: "" },
	category : { type : String, default: "Anime" },
	builder : { type: Schema.Types.ObjectId, ref:'users', required: true },
	checker : { type: Schema.Types.ObjectId, ref:'users', required: true },
	createTime : { type : Date, default : Date.now }
});

var scenes = new Schema({
	name : { type : String, required : true },
	description : { type : String, default: "" },
	localImgUrl : { type: String, default: "" },
	workImgUrl : { type: String, default: "" },
	placemark :  { type: Schema.Types.ObjectId, ref:'placemark' },
	work : { type: Schema.Types.ObjectId, ref:'works' },
	checker : { type: Schema.Types.ObjectId, ref:'users', required: true },
	builder : { type: Schema.Types.ObjectId, ref:'users', required: true },
	createTime : { type : Date, default : Date.now }
});

var placemarks = new Schema({
	name : { type : String, required : true },
	latitude : { type : Number, required : true },
	longitude : { type : Number, required : true },
	description : { type : String, default: "" },
	work : [{ type: Schema.Types.ObjectId, ref:'works' }],
	checker : { type: Schema.Types.ObjectId, ref:'users', required: true },
	builder : { type: Schema.Types.ObjectId, ref:'users', required: true },
	createTime : { type : Date, default : Date.now }
});

var users = new Schema({
	name : { type : String, required : true, unique : true },
	accountKey : { type : String, required : true, unique : true },
	accountKind : { type : Number, default : 0 },
	createTime : { type : Date, default : Date.now }
});

works.methods.getAllName = function(callback){
	return this.j_name + '/' + c_name + '/';
};

mongoose.model('works', works);
mongoose.model('scenes', scenes);
mongoose.model('placemarks', placemarks);
mongoose.model('users', users);

mongoose.connect('mongodb://localhost:27017/PilgrimageMapDB');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Conncet database fail.'));
db.once('open', function callback() {
	console.log("Connect database success.");
});