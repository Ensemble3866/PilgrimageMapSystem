require('../lib/db');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'); 
var Works = mongoose.model('works');
var Scenes = mongoose.model('scenes');
var Placemarks = mongoose.model('placemarks');
var Users = mongoose.model('users');

/* Handle request of homepage. */
router.get('/', function(req, res, next) {
	Placemarks.find({}).populate('work').exec(function(err, _placemark){
		if(err) {
			console.log("placemark load fail.");
			res.send("Server error.");
		}
		res.render('index.ejs', { placemark: _placemark });
	});
});

/* Handle request of ajax. */
router.get('/placemark/:placemarkId', function(req, res, next){
	Placemarks.findOne({ _id: req.params.placemarkId }).populate('work').exec(function(err, _placemark){
		if(err){
			console.log("scene load fail.");
			res.send("Server error.");
		}
		res.send(_placemark);
	});
});

module.exports = router;
