require('../lib/db');
var express = require('express');
var router = express.Router();
var multer  = require('multer');
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose'); 
var Placemarks = mongoose.model('placemarks');
var tagHistory = mongoose.model('tagHistory');
var Users = mongoose.model('users');
var upload = multer({
	dest: 'public/imgs/',
	fileFilter: function(req, file, callback) {
		var ext = path.extname(file.originalname);
		if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
			//callback(null, false);
			extnameError = new Error("上傳的圖片中包含錯誤的檔案格式！");
			extnameError.type = "extnameError";
			callback(extnameError);
		}
		callback(null, true);
	}
});

/* Handle request of homepage. */
router.get('/', function(req, res, next) {
	
	Placemarks.find({}).exec(function(err, _placemark){
		if(err) next(err);
		
		req.session.auth = 3;
		res.render('index.ejs', { placemark: _placemark });
	});
});

/* Get user authority.  */
router.post('/userAuth', function(req, res, next){
	Users.findOne({ $and:[ { accountKey : req.body.userId }, { accountKind : req.body.website } ]}).exec(function(err, _user){
		if(err) next(err);
		if(_user == null){
			var newUser = new Users({
				name : req.body.userName,
				accountKey : req.body.userId,
				accountKind : req.body.website,
				authLevel : 2
			});
			newUser.save(function(err){
				if(err) next(err);
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

/* Get placemark infomation. */
router.get('/placemark/:placemarkId', function(req, res, next){
	Placemarks.findOne({ _id: req.params.placemarkId }).exec(function(err, _placemark){
		if(err) next(err);
		req.session.curPlacemark = _placemark._id;
		var isSaved = false;
		Users.findOne({ _id: req.session.curUser }).exec(function(err, _user){
			for(var i = 0; i < _user.savedPlacemark.length; i++){
				if(_user.savedPlacemark[i].toString() == req.session.curPlacemark.toString()){
					isSaved = true;
					break;
				}
			}
			res.render('placemarkInfo.ejs', {mod: req.session.auth, saved: isSaved, placemark: _placemark});
		});
	});
});

router.get('/getAllSavedPlacemarkOfUser', function(req, res, next){
	Users.findOne({ _id: req.session.curUser }).exec(function(err, _user){
		res.send(_user.savedPlacemark);
	});
});

/* 紀錄景點 */
router.get('/saveUserPlacemark', function(req, res, next){
	Users.findOne({ _id: req.session.curUser }).exec(function(err, _user){
		_user.savedPlacemark.push(req.session.curPlacemark);
		_user.save(function(err){
			if(err) next(err);
		});
		res.status(200).send("success");
	});
});

/* 取消紀錄景點 */
router.get('/removeUserPlacemark', function(req, res, next){
	Users.findOne({ _id: req.session.curUser }).exec(function(err, _user){
		for(var i = 0; i < _user.savedPlacemark.length; i++){
			if(_user.savedPlacemark[i] == req.session.curPlacemark){
				_user.savedPlacemark.splice(i, 1);
				_user.save(function(err){
					if(err) next(err);
				});
				break;
			}
		}
		res.status(200).send("success");
	});
});

/* Add current placemark's tag by common user. */
router.post('/addTag', function(req, res, next){
	Placemarks.findOne({ _id: req.session.curPlacemark }).exec(function(err, _placemark){
		if(err) next(err);
		_placemark.tag.push(req.body.newTag);
		_placemark.save(function(err){
			if(err) next(err);
		});
		var newHistory = new tagHistory({
			tag: req.body.newTag,
			placemark:  req.session.curPlacemark,
			isAdd: true,
			builder: req.session.curUser,
			checker: req.session.curUser
		});
		newHistory.save(function(err){
			if(err) next(err);
		});
	});
	res.status(200).send(req.body.newTag);
});

/* Delete current placemark's tag by common user. */
router.post('/delTag', function(req, res, next){
	Placemarks.findOne({ _id: req.session.curPlacemark }).exec(function(err, _placemark){
		if(err) next(err);
		for(var i in _placemark.tag){
			if(_placemark.tag[i] == req.body.tag){
				_placemark.tag.splice(i, 1);
				_placemark.save(function(err){
					if(err) next(err);
				});
				var newHistory = new tagHistory({
					tag: req.body.tag,
					placemark:  req.session.curPlacemark,
					isAdd: false,
					builder: req.session.curUser,
					checker: req.session.curUser
				});
				newHistory.save(function(err){
					if(err) next(err);
				});
				break;
			}
		}
	});
	res.status(200).send("success");
});

module.exports = router;