require('../lib/db');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'); 
var Works = mongoose.model('works');
var Scenes = mongoose.model('scenes');
var Placemarks = mongoose.model('placemarks');
var Users = mongoose.model('users');
var extArticles = mongoose.model('extArticles');

/* Handle request of homepage. */
router.get('/', function(req, res, next) {
	
	Placemarks.find({}).populate('work').exec(function(err, _placemark){
		if(err) res.status(500).send(err);
		
		req.session.auth = 3;
		res.render('index.ejs', { placemark: _placemark });
	});
});

router.post('/userAuth', function(req, res, next){
	Users.findOne({ $and:[ { accountKey : req.body.userId }, { accountKind : req.body.website } ]}).exec(function(err, _user){
		if(err) return handleError(err);
		if(_user == null){
			var newUser = new Users({
				name : req.body.userName,
				accountKey : req.body.userId,
				accountKind : req.body.website,
				authLevel : 2
			});
			newUser.save(function(err){
				if(err) res.status(500).send(err);
			});
			req.session.auth = 2;
			req.session.curUser = newUser._id;
		}
		else {
			req.session.auth = _user.authLevel;
			req.session.curUser = _user._id;
		}
		res.send({code : req.session.auth});
	});
});

/* Handle request of ajax. */
router.get('/placemark/:placemarkId', function(req, res, next){
	Placemarks.findOne({ _id: req.params.placemarkId }).populate('work').sort('work').exec(function(err, _placemark){
		if(err) res.status(500).send(err);

		Scenes.find({ placemark: _placemark._id }).sort('work').exec(function(err, _scenes){
			res.render('placemarkInfo.ejs', {placemark: _placemark, scenes: _scenes});
		});
	});
});

module.exports = router;
