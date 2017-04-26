require('../lib/db');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Works = mongoose.model('works');
var Scenes = mongoose.model('scenes');
var Placemarks = mongoose.model('placemarks');
var Users = mongoose.model('users'); 

/* GET /manage page. */
router.get('/', function(req, res, next) {
	//set testUser
	Users.findOne({name:"ensemble3866"}, function(err, _user){
		if(err) {
			console.log("user load fail.");
			res.send("Server error.");
		}
		req.session.curUser = _user._id;
	});

	Works.find({}, function(err, _work){
		if(err) return handleError(err);
		Placemarks.find({}, function(err, _placemark){
			if(err) return handleError(err);
			res.render('manage.ejs', { workList: _work, placemarkList: _placemark });
		});
	});
});

/* GET request from Ajax. */
router.post('/getWorkInfo', function(req, res, next) {
	Works.findOne({ _id: req.body.workId }).exec(function(err, _work){
		if(err) return handleError(err);
		res.send(_work);
	});
});

router.post('/getPlacemarkInfo', function(req, res, next) {
	Placemarks.findOne({ _id: req.body.workId }).exec(function(err, _placemark){
		if(err) return handleError(err);
		res.send(_placemark);
	});
});

/* Handle model control */
router.post('/submitWork', function(req, res, next) {
	switch(req.body.rdoWork){
		case "add": 
			var newWork = new Works({
				j_name: req.body.workJName,
				c_name: req.body.workCName,
				introduction: req.body.workIntr,
				category: "Anime",
				builder: req.session.curUser,
				checker: req.session.curUser
			});
			newWork.save(function(err){
				if(err) return handleError(err);
			});
			break;
		case "edit":
			Works.findOne({ _id: req.body.selectEditWork }).exec(function(err, _work){
				if(err) return handleError(err);
				_work.j_name = req.body.workJName;
				_work.c_name =  req.body.workCName;
				_work.introduction = req.body.workIntr;
				_work.category = "Anime";
				_work.save(function(err){
					if(err) return handleError(err);
				});
			});
			break;
		case "del":
			Works.findOne({ _id: req.body.selectEditWork }).exec(function(err, _work){
				if(err) return handleError(err);
				_work.remove(function(err){
					if(err) return handleError(err);
				});
			});
			break;
		default:
			break;
	}
	res.redirect('/manage');
});

router.post('/submitPlacemark', function(req, res, next) {
	switch(req.body.rdoPlacemark){
		case "add":
			var newPlacemark = new Placemarks({
				name: req.body.placemarkName,
				latitude: req.body.latNum,
				longitude: req.body.lngNum,
				description: req.body.placemarkDesc,
				//work: req.body.haveWork,
				builder: req.session.curUser,
				checker: req.session.curUser
			});
			newPlacemark.save(function(err){
				if(err) return handleError(err);
			});
			break;
		case "edit":
			Placemarks.findOne({ _id: req.body.selectEditPlacemark }).exec(function(err, _placemark){
				if(err) return handleError(err);
				_placemark.name = req.body.placemarkName;
				_placemark.latitude = req.body.latNum;
				_placemark.longitude = req.body.lngNum;
				_placemark.description = req.body.placemarkDesc;
				//work: req.body.haveWork,
				_placemark.save(function(err){
					if(err) return handleError(err);
				});
			});
			break;
		case "del":
			Placemarks.findOne({ _id: req.body.selectEditPlacemark }).exec(function(err, _placemark){
				if(err) return handleError(err);
				_placemacrk.remove(function(err){
					if(err) return handleError(err);
				});
			});
			break;
		default:
			break;
	}
	res.redirect('/manage');
});

module.exports = router;