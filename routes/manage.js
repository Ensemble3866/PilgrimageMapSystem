require('../lib/db');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Works = mongoose.model('works');
var Scenes = mongoose.model('scenes');
var Placemarks = mongoose.model('placemarks');
var CompareImgs = mongoose.model('compareImgs');
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

/* GET request from Ajax. */
router.post('/getWorkInfo', function(req, res, next) {
	Works.findOne({ _id: req.body.workId }).exec(function(err, _work){
		if(err){
			console.log("work load fail.");
			res.send("Server error.");
		}
		res.send(_work);
	});
});

router.post('/getSceneInfo', function(req, res, next) {
	Scenes.findOne({ _id: req.body.sceneId }).exec(function(err, _scene){
		if(err){
			console.log("scene load fail.");
			res.send("Server error.");
		}
		res.send(_scene);
	});
});

/* Handle model control */
router.post('/submitWork', function(req, res, next) {
	switch(req.body.rdoWork){
		case "add": 
			var newWork = new Works({
				j_name: req.body.workJName,
				c_name: req.body.workCName,
				e_name: req.body.workEName,
				introduction: req.body.workIntr,
				category: "anime",
				builder: req.session.curUser,
				checker: req.session.curUser
			});
			newWork.save(function(err){
				if(err) {
					console.log(err);
					return handleError(err);
				}
			});
			break;
		case "edit":
			Works.update({ id: req.body.SelectEditWork }, {
				j_name: req.body.workJName,
				c_name: req.body.workCName,
				e_name: req.body.workEName,
				introduction: req.body.workIntr,
				category: "anime",
				builder: req.session.curUser,
				checker: req.session.curUser
			}, function(err){
				if(err)
					console.log("Update work fail.");
			});
			break;
		case "del":
			Works.remove({ id: req.body.SelectEditWork }, function(err){
				if(err)
					console.log("Remove work fail.");
			});
			break;
		default:
			console.log("Something wrong.");
			break;
	}
	res.redirect('/manage');
});

router.post('/submitScene', function(req, res, next) {
	switch(req.body.rdoScene){
		case "add":
			var newScene = new Scenes({
				name: req.body.sceneName,
				latitude: req.body.latNum,
				longitude: req.body.lngNum,
				description: req.body.sceneDesc,
				builder: req.session.curUser,
				checker: req.session.curUser
			});
			newScene.save(function(err){
				if(err) {
					console.log(err);
					return handleError(err);
				}
			});
			break;
		case "edit":
			Scenes.update({ id: req.body.SelectEditScene }, {
				ame: req.body.sceneName,
				latitude: req.body.latNum,
				longitude: req.body.lngNum,
				description: req.body.sceneDesc,
				builder: req.session.curUser,
				checker: req.session.curUser
			}, function(err){
				if(err)
					console.log("Update scene fail.");
			});
			break;
		case "del":
			Works.remove({ id: req.body.SelectEditScene }, function(err){
				if(err)
					console.log("Remove scene fail.");
			});
			break;
		default:
			console.log("Something wrong.");
			break;
	}
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