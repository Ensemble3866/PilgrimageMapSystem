require('../lib/db');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Works = mongoose.model('works');
var Scenes = mongoose.model('scenes');
var Placemarks = mongoose.model('placemarks');
var CompareImgs = mongoose.model('compareImgs');
var Users = mongoose.model('users'); 

//Handle model control
router.post('/submitWork', function(req, res, next) {

	var newWork = new Works({
		j_name: req.body.workJName,
		c_name: req.body.workCName,
		e_name: req.body.workEName,
		category: "anime",
		builder: req.session.curUser,
		checker: req.session.curUser
	});
	newWork.save(function(err){
		if(err) {
			console.log(err);
			return handleError(err);
		}
	})
	res.redirect('/manage');
});

router.post('/submitScene', function(req, res, next) {

	var newScene = new Scenes({
		name: req.body.sceneName,
		latitude: req.body.latNum,
		longitude: req.body.lngNum,
		builder: req.session.curUser,
		checker: req.session.curUser
	});
	newScene.save(function(err){
		if(err) {
			console.log(err);
			return handleError(err);
		}
	})
	res.redirect('/manage');
});


router.post('/submitPlacemark', function(req, res, next) {

	var newPlacemark = new Placemarks({
		work: req.body.selectWork,
		scene: req.body.selectScene,
		builder: req.session.curUser,
		checker: req.session.curUser
	});
	newPlacemark.save(function(err){
		if(err) {
			console.log(err);
			return handleError(err);
		}
	})
	res.redirect('/manage');
});

module.exports = router;