const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log(ip);
	res.render('main', {title: 'Ontelier - Main'});
});

router.get('/login', function(req, res, next) {
	res.render('login', {title: 'Ontelier - Login'});
});

router.get('/join', function(req, res, next) {
	res.render('join', {title: 'Ontelier - Join'});
});

module.exports = router;
