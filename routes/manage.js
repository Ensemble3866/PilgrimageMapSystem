require('../lib/db');
var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var fs = require('fs');
var mongoose = require('mongoose');
var Works = mongoose.model('works');
var Scenes = mongoose.model('scenes');
var Placemarks = mongoose.model('placemarks');
var Users = mongoose.model('users'); 

/* GET /manage page. */
router.get('/', function(req, res, next) {
	if(req.session.auth > 1){
		res.redirect('/');
		res.end();
	}
	Works.find({}, function(err, _work){
		if(err) res.status(500).send(err);
		Placemarks.find({}, function(err, _placemark){
			if(err) res.status(500).send(err);
			Scenes.find({}, function(err, _scene){
				res.render('manage.ejs', { workList: _work, placemarkList: _placemark, sceneList: _scene });
			});
		});
	});
});

/* GET request from Ajax. */
router.post('/getWorkInfo', function(req, res, next) {
	Works.findOne({ _id: req.body.workId }).exec(function(err, _work){
		if(err) res.status(500).send(err);
		res.send(_work);
	});
});

router.post('/getPlacemarkInfo', function(req, res, next) {
	Placemarks.findOne({ _id: req.body.placemarkId }).populate('work').exec(function(err, _placemark){
		if(err) res.status(500).send(err);
		res.send(_placemark);
	});
});

router.post('/getSceneInfo', function(req, res, next) {
	Scenes.findOne({ _id: req.body.sceneId }).exec(function(err, _scene){
		if(err) res.status(500).send(err);
		res.send(_scene);
	});
});

router.post('/addWorkToPlacemark', function(req, res, next){
	Placemarks.findOne({ _id: req.body.placemarkId }).exec(function(err, _placemark){
		if(err) res.status(500).send(err);
		_placemark.work.push(req.body.workId);
		_placemark.save(function(err){
			if(err) res.status(500).send(err);
		});
	});
	res.send("success");
});

router.post('/DelWorkFromPlacemark', function(req, res, next){
	Placemarks.findOne({ _id: req.body.placemarkId }).exec(function(err, _placemark){
		if(err) res.status(500).send(err);
		for(index in _placemark.work){
			if(_placemark.work[index] == req.body.workId){
				_placemark.work.splice(index, 1);
				_placemark.save(function(err){
					if(err) res.status(500).send(err);
				});
			}
		}
	});
	res.send("success");
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
				if(err) res.status(500).send(err);
			});
			break;
		case "edit":
			Works.findOne({ _id: req.body.sltWork }).exec(function(err, _work){
				if(err) res.status(500).send(err);
				_work.j_name = req.body.workJName;
				_work.c_name =  req.body.workCName;
				_work.introduction = req.body.workIntr;
				_work.category = "Anime";
				_work.save(function(err){
					if(err) res.status(500).send(err);
				});
			});
			break;
		case "del":
			Works.findOne({ _id: req.body.sltWork }).exec(function(err, _work){
				if(err) res.status(500).send(err);
				_work.remove(function(err){
					if(err) res.status(500).send(err);
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
				builder: req.session.curUser,
				checker: req.session.curUser
			});
			newPlacemark.save(function(err){
				if(err) res.status(500).send(err);
			});
			break;
		case "edit":
			Placemarks.findOne({ _id: req.body.sltPlacemark }).exec(function(err, _placemark){
				if(err) res.status(500).send(err);
				_placemark.name = req.body.placemarkName;
				_placemark.latitude = req.body.latNum;
				_placemark.longitude = req.body.lngNum;
				_placemark.description = req.body.placemarkDesc;
				_placemark.save(function(err){
					if(err) res.status(500).send(err);
				});
			});
			break;
		case "del":
			Placemarks.findOne({ _id: req.body.sltPlacemark }).exec(function(err, _placemark){
				if(err) res.status(500).send(err);
				_placemacrk.remove(function(err){
					if(err) res.status(500).send(err);
				});
			});
			break;
		default:
			break;
	}
	res.redirect('/manage');
});

router.post('/submitScene', function(req, res, next){
	var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = 'public/imgs/';
    form.keepExtensions = true;
    form.maxFieldsSize = 2 * 1024 * 1024;
	
    form.parse(req, function(err, fields, files){
        if(err){
        	res.locals.error = err;
    		res.redirect('/manage');
        	return;    
        }

        var wSceneExtName = "";
		var rSceneExtName = "";
        switch (files.uploadWorkScene.type) {
            case 'image/pjpeg':
            case 'image/jpeg':
            	wSceneExtName = 'jpg';
                break;         
            case 'image/png':
            case 'image/x-png':
                wSceneExtName = 'png';
                break;         
        }
		switch (files.uploadRealScene.type) {
            case 'image/pjpeg':
            case 'image/jpeg':
                 rSceneExtName = 'jpg';
                break;         
            case 'image/png':
            case 'image/x-png':
                 rSceneExtName = 'png';
                break;         
        }

        if(wSceneExtName.length == 0 || rSceneExtName.length == 0){
			res.redirect('/manage');
            return;                   
        }
		var randomName =  Math.floor(Math.random()*100000000000);
        var wSceneNewName = 'w' + randomName + '.' + wSceneExtName;
		var rSceneNewName = 'r' + randomName + '.' + rSceneExtName;
        var w_newPath = form.uploadDir + wSceneNewName;
		var r_newPath = form.uploadDir + rSceneNewName;
        fs.renameSync(files.uploadWorkScene.path, w_newPath);
		fs.renameSync(files.uploadRealScene.path, r_newPath);
		
		switch(fields.rdoScene){
			case "add":
				var newScene = new Scenes({
					name: fields.sceneName,
					description: fields.sceneDesc,
					workImgUrl: wSceneNewName,
					realImgUrl: rSceneNewName,
					placemark: fields.sltSceneOfPlacemark,
					work: fields.sltSceneOfWork,
					builder: req.session.curUser,
					checker: req.session.curUser
				});
				newScene.save(function(err){
					if(err) res.status(500).send(err);
				});
				break;
			case "edit":
				Scenes.findOne({ _id: fields.sltScene }).exec(function(err, _scene){
					if(err) res.status(500).send(err);
					fs.unlinkSync("public/imgs/" + _scene.workImgUrl);
					fs.unlinkSync("public/imgs/" + _scene.realImgUrl);
					_scene.name = fields.sceneName;
					_scene.description = fields.sceneDesc;
					_scene.workImgUrl = wSceneNewName;
					_scene.realImgUrl = rSceneNewName;
					_scene.placemark =  fields.sltSceneOfPlacemark;
					_scene.work = fields.sltSceneOfWork;
					_scene.save(function(err){
						if(err) res.status(500).send(err);
					});
				});
				break;
			case "del":
				Scenes.findOne({ _id: fields.sltScene }).exec(function(err, _scene){
					if(err) res.status(500).send(err);
					fs.unlinkSync("public/imgs/" + _scene.workImgUrl);
					fs.unlinkSync("public/imgs/" + _scene.realImgUrl);
					_scene.remove(function(err){
						if(err) res.status(500).send(err);
					});
				});
				break;
			default:
				break;
		}

    	res.redirect('/manage'); 
    });
});

module.exports = router;