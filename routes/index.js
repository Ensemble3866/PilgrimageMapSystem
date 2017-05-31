require('../lib/db');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'); 
var Placemarks = mongoose.model('placemarks');
var tagHistory = mongoose.model('tagHistory');
var Scenes = mongoose.model('scenes');
var Users = mongoose.model('users');
var extArticles = mongoose.model('extArticles');

/* Handle request of homepage. */
router.get('/', function(req, res, next) {
	
	Placemarks.find({}).exec(function(err, _placemark){
		if(err) res.status(500).send(err);
		
		req.session.auth = 3;
		res.render('index.ejs', { placemark: _placemark });
	});
});

/* Get user authority.  */
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

/* Add new placemark. */
router.post('/addPlacemark', function(req, res, next) {
	var tagList = req.body.placemarkTagList.split(',');
	var newPlacemark = new Placemarks({
		name: req.body.placemarkName,
		address: req.body.placemarkAddress,
		latitude: req.body.placemarkLat,
		longitude: req.body.placemarkLng,
		description: req.body.placemarkDesc,
		tag: tagList,
		builder: req.session.curUser,
		checker: req.session.curUser
	});
	//Add tag to tagHistory.
	newPlacemark.save(function(err, newPlk){
		if(err) res.status(500).send(err);
		for(var i in tagList){
			var newHistory = new tagHistory({
				tag: tagList[i],
				placemark:  newPlk._id,
				isAdd: true,
				builder: req.session.curUser,
				checker: req.session.curUser
			});
			newHistory.save(function(err){
				if(err) res.status(500).send(err);
			});
		}
	});
	res.redirect('/');
});

/* Get placemark infomation. */
router.get('/placemark/:placemarkId', function(req, res, next){
	Placemarks.findOne({ _id: req.params.placemarkId }).exec(function(err, _placemark){
		if(err) res.status(500).send(err.message);
		req.session.curPlacemark = _placemark._id;
		res.render('placemarkInfo.ejs', {mod: req.session.auth, placemark: _placemark});
	});
});

/*Delete placemark. */
router.get('/delPlacemark', function(req, res, next) {
	//確認權限
	if(req.session.auth > 2){
		res.redirect('/');
		res.end();
	}
	Placemarks.findOne({ _id: req.session.curPlacemark }).exec(function(err, _placemark){
		if(err) res.status(500).send(err.message);
		var placemarkId = req.session.curPlacemark;
		var tagList = _placemark.tag;
		for(i = 0; i < tagList.length; i++){
			var newHistory = new tagHistory({
				tag: tagList[i],
				placemark: placemarkId,
				isAdd: false,
				builder: req.session.curUser,
				checker: req.session.curUser
			});
			newHistory.save(function(err){
				if(err) res.status(500).send(err);
			});
		}
		req.session.curPlacemark = null;
		_placemark.remove(function(err){
			if(err) res.status(500).send(err);
		});
	});
	res.send("success");
});

/* Add current placemark's tag. */
router.post('/submitTag', function(req, res, next){
	Placemarks.findOne({ _id: req.session.curPlacemark }).exec(function(err, _placemark){
		if(err) res.status(500).send(err);
		_placemark.tag.push(req.body.tag);
		_placemark.save(function(err){
			if(err) res.status(500).send(err);
		});
		var newHistory = new tagHistory({
			tag: req.body.tag,
			placemark:  req.session.curPlacemark,
			isAdd: true,
			builder: req.session.curUser,
			checker: req.session.curUser
		});
		newHistory.save(function(err){
			if(err) res.status(500).send(err);
		});
	});
	res.status(200).send("success");
});

/* Delete current placemark's tag. */
router.post('/delTag', function(req, res, next){
	Placemarks.findOne({ _id: req.session.curPlacemark }).exec(function(err, _placemark){
		if(err) res.status(500).send(err);
		for(var i in _placemark.tag){
			if(_placemark.tag[i] == req.body.tag){
				_placemark.tag.splice(i, 1);
				_placemark.save(function(err){
					if(err) res.status(500).send(err);
				});
				var newHistory = new tagHistory({
					tag: req.body.tag,
					placemark:  req.session.curPlacemark,
					isAdd: false,
					builder: req.session.curUser,
					checker: req.session.curUser
				});
				newHistory.save(function(err){
					if(err) res.status(500).send(err);
				});
				break;
			}
		}
	});
	res.status(200).send("success");
});

module.exports = router;
