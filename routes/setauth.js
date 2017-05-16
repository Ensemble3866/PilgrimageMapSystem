require('../lib/db');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Users = mongoose.model('users'); 

router.get('/', function(req, res, next) {
	if(req.session.auth != 0){
		res.redirect('/');
		res.end();
	}
    Users.find({}).exec(function(err, _users){
		if(err) res.status(500).send(err);
        res.render('setauth.ejs', { userList : _users });
	});
});

router.post('/changeAuth', function(req, res, next) {
    Users.findOne({ _id : req.body.userId }).exec(function(err, _user){
		if(err) res.status(500).send(err);
        _user.authLevel = req.body.newLevel;
        _user.save(function(err){
			if(err) res.status(500).send(err);
		});
        res.sendStatus(200);
	});
});

module.exports = router;