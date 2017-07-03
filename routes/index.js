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

/* Add new placemark. */
router.post('/addPlacemark', upload.array('uploadImg', 10), function(req, res, next) {
	// check user's authority that confirm the access is legal.
	if(req.session.auth > 2){
		next(new Error("非法操作！請重新登入。"));
	}
	var tagList = req.body.placemarkTagList.split(',');
	var imgList = [];
	var blogList = [];

	for(var i = 0; i < req.files.length; i++){
		var extName = "";
		switch(req.files[i].mimetype){
			case 'image/pjpeg':
			case 'image/jpeg':
			case 'image/jpg':
				extName = 'jpg';
				break;         
			case 'image/png':
			case 'image/x-png':
				extName = 'png';
				break;
			default:
				break;
		}
		if(extName.length == 0){
			next(new Error("上傳的圖片中包含錯誤的檔案格式！"));
		}
		var imgName = Date.now().toString() + '.' + extName;
		var imgPath = "public/imgs/" +imgName;
		var newImg = { url : imgName, remark : req.body.imgDesc[i] };
        fs.renameSync("public/imgs/" + req.files[i].filename, imgPath);
		imgList.push(newImg);
	}

	/* blog連結為一個或多個 */
	if(typeof req.body.placemarkBlogUrl == "object"){
		for(var i = 0; i < req.body.placemarkBlogUrl.length; i++){
			var newBlog = { title : req.body.placemarkBlogTitle[i], url : req.body.placemarkBlogUrl[i] };
			blogList.push(newBlog);
		}
	}
	else if(typeof req.body.placemarkBlogUrl == "string"){
		var newBlog = { title : req.body.placemarkBlogTitle, url : req.body.placemarkBlogUrl };
		blogList.push(newBlog);
	}
	
	/* Build new placemark. */
	var newPlacemark = new Placemarks({
		name: req.body.placemarkName,
		address: req.body.placemarkAddress,
		latitude: req.body.placemarkLat,
		longitude: req.body.placemarkLng,
		description: req.body.placemarkDesc,
		tag: tagList,
		img : imgList,
		blog : blogList,
		builder: req.session.curUser,
		checker: req.session.curUser
	});

	/* Add tag to tagHistory. */
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
	//Confirm authority
	if(req.session.auth > 2){
		res.redirect('/');
		res.end();
	}
	Placemarks.findOne({ _id: req.session.curPlacemark }).exec(function(err, _placemark){
		if(err) next(err);
		var placemarkId = req.session.curPlacemark;
		var tagList = _placemark.tag;
		var imgList = _placemark.img;
		for(i = 0; i < tagList.length; i++){
			var newHistory = new tagHistory({
				tag: tagList[i],
				placemark: placemarkId,
				isAdd: false,
				builder: req.session.curUser,
				checker: req.session.curUser
			});
			newHistory.save(function(err){
				if(err) next(err);
			});
		}
		for(i = 0; i < imgList.length; i++){
			fs.unlinkSync("public/imgs/" + imgList.url);
		}
		req.session.curPlacemark = null;
		_placemark.remove(function(err){
			if(err) next(err);
		});
	});
	res.send("success");
});

/* Add current placemark's tag. */
router.post('/submitTag', function(req, res, next){
	Placemarks.findOne({ _id: req.session.curPlacemark }).exec(function(err, _placemark){
		if(err) next(err);
		_placemark.tag.push(req.body.tag);
		_placemark.save(function(err){
			if(err) next(err);
		});
		var newHistory = new tagHistory({
			tag: req.body.tag,
			placemark:  req.session.curPlacemark,
			isAdd: true,
			builder: req.session.curUser,
			checker: req.session.curUser
		});
		newHistory.save(function(err){
			if(err) next(err);
		});
	});
	res.status(200).send("success");
});

/* Delete current placemark's tag. */
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

router.post('/editAddress', function(req, res, next){
	Placemarks.findOne({ _id: req.session.curPlacemark }).exec(function(err, _placemark){
		if(err) next(err);
		_placemark.address = req.body.newAddress;
		_placemark.save(function(err){
			if(err) next(err);
		});
		res.status(200).send("success");
	});
});

router.post('/addBlog', function(req, res, next){
	Placemarks.findOne({ _id: req.session.curPlacemark }).exec(function(err, _placemark){
		if(err) next(err);
		var newBlog = { url :  req.body.newUrl, title : req.body.newTitle };
		_placemark.blog.push(newBlog);
		_placemark.save(function(err){
			if(err) next(err);
		});
		res.status(200).send("success");
	});
});

router.post('/delBlog', function(req, res, next){
	Placemarks.findOne({ _id: req.session.curPlacemark }).exec(function(err, _placemark){
		if(err) next(err);
		for(var i in _placemark.blog){
			if(_placemark.blog[i].title == req.body.delTitle){
				_placemark.blog.splice(i, 1);
				_placemark.save(function(err){
					if(err) next(err);
				});
				break;
			}
		}
		res.status(200).send("success");
	});
});

router.post('/editDesc', function(req, res, next){
	Placemarks.findOne({ _id: req.session.curPlacemark }).exec(function(err, _placemark){
		if(err) next(err);
		_placemark.description = req.body.newDesc;
		_placemark.save(function(err){
			if(err) next(err);
		});
		res.status(200).send("success");
	});
});

router.post('/addImg', upload.single('newImg'), function(req, res, next){
	Placemarks.findOne({ _id: req.session.curPlacemark }).exec(function(err, _placemark){
		if(err) next(err);

		var extName = "";
		switch(req.file.mimetype){
			case 'image/pjpeg':
			case 'image/jpeg':
			case 'image/jpg':
				extName = 'jpg';
				break;         
			case 'image/png':
			case 'image/x-png':
				extName = 'png';
				break;
			default:
				break;
		}
		if(extName.length == 0){
			next(new Error("上傳的圖片中包含錯誤的檔案格式！"));
		}
		var imgName = Date.now().toString() + '.' + extName;
		var imgPath = "public/imgs/" +imgName;
		var newImg = { url : imgName, remark : req.body.newImgRemark };
        fs.renameSync("public/imgs/" + req.file.filename, imgPath);
		_placemark.img.push(newImg);

		_placemark.save(function(err){
			if(err) next(err);
		});
		res.redirect('/');
	});
});

router.post('/delImg', function(req, res, next){
	Placemarks.findOne({ _id: req.session.curPlacemark }).exec(function(err, _placemark){
		if(err) next(err);
		for(var i in _placemark.img){
			if(_placemark.img[i].url == req.body.delImgUrl.substring(5)){
				fs.unlinkSync("public/imgs/" + _placemark.img[i].url);
				_placemark.img.splice(i, 1);
				_placemark.save(function(err){
					if(err) next(err);
				});
				break;
			}
		}
		res.status(200).send("success");
	});
});

module.exports = router;
