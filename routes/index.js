require('../lib/db');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'); 
var Works = mongoose.model('works');
var Scenes = mongoose.model('scenes');
var Placemarks = mongoose.model('placemarks');
var CompareImgs = mongoose.model('compareImgs');
var Users = mongoose.model('users');

/* GET home page. */
router.get('/', function(req, res, next) {
	Placemarks.find({}).populate('scene').populate('work').exec(function(err, _placemark){
		if(err) {
			console.log("placemark load fail.");
			res.send("Server error.");
		}
		res.render('Homepage.ejs', { placemark: _placemark });
	});
 	
});

router.get('/placemark/:placemarkId', function(req, res, next){
	Placemarks.findOne({ _id: req.params.placemarkId }).populate('scene').populate('work').exec(function(err, _placemark){
		if(err){
			console.log("scene load fail.");
			res.send("Server error.");
		}
		res.send(_placemark);
	});
});

router.get('/manage', function(req, res, next) {
	//set testUser
	Users.findOne({name:"ensemble3866"}, function(err, _user){
		if(err) {
			console.log("user load fail.");
			res.send("Server error.");
		}
		req.session.curUser = _user._id;
	});

	Works.find({}, function(err, _work){
		if(err) {
			console.log("work load fail.");
			res.send("Server error.");
			return;
		}
		Scenes.find({}, function(err, _scene){
			if(err) {
				console.log("scene load fail.");
				res.send("Server error.");
				return;
			}
			res.render('Manage.ejs', { workList: _work, sceneList: _scene });
		});
	});
});

module.exports = router;
