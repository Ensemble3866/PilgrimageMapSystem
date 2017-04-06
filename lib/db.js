var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var works = new Schema({
	j_name : { type : String, required : true, unique : true },
	c_name : { type : String, required : true, unique : true },
	e_name : { type : String, required : true, unique : true },
	introduction : { type : String },
	category : { type : String, default: "Anime" },
	builder : [{ type: Schema.Types.ObjectId, ref:'users' }],
	checker : [{ type: Schema.Types.ObjectId, ref:'users' }],
	createTime : { type : Date, default : Date.now }
});

var scenes = new Schema({
	name : { type : String, required : true },
	latitude : { type : Number, required : true },
	longitude : { type : Number, required : true },
	description : { ype : String },
	checker : [{ type: Schema.Types.ObjectId, ref:'users' }],
	builder : [{ type: Schema.Types.ObjectId, ref:'users' }],
	createTime : { type : Date, default : Date.now }
});

var placemarks = new Schema({
	work : [{ type: Schema.Types.ObjectId, ref:'works' }],
	scene :  [{ type: Schema.Types.ObjectId, ref:'scenes' }],
	checker : [{ type: Schema.Types.ObjectId, ref:'users' }],
	builder : [{ type: Schema.Types.ObjectId, ref:'users' }],
	createTime : { type : Date, default : Date.now }
});

var compareImgs = new Schema({
	workScenes : { type : String, required : true }, //path
	realSCenes : { type : String, required : true }, //path
	description : { type : String },
	uploader : [{ type: Schema.Types.ObjectId, ref:'users' }],
	createTime : { type : Date, default : Date.now }
});

var users = new Schema({
	name : { type : String, required : true, unique : true },
	accountKey : { type : String, required : true, unique : true },
	accountKind : { type : Number, default : 0 },
	createTime : { type : Date, default : Date.now }
});

works.methods.getAllName = function(callback){
	return this.j_name + '/' + c_name + '/' + e_name;
};

mongoose.model('works', works);
mongoose.model('scenes', scenes);
mongoose.model('placemarks', placemarks);
mongoose.model('compareImgs', compareImgs);
mongoose.model('users', users);

mongoose.connect('mongodb://localhost:27017/PilgrimageMapDB');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Conncet database fail.'));
db.once('open', function callback() {
	console.log("Connect database success.");
});