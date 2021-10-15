const express = require('express');
const Conn = require('../models/conn');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

router.use((req, res, next) => {
	res.locals.user = req.user;
	next();
})

router.get('/', function(req, res, next) {
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	Conn.create({
		conn_ip: ip,
	})
	.then((result) => {
		console.log(result);
	})
	.catch((error) => {
		console.error(error);
	});
	res.render('main', {title: 'Ontelier - Main'});
});

router.get('/login', isNotLoggedIn, (req, res) =>  {
	res.render('login', {title: 'Ontelier - Login'});
});

router.get('/join', isNotLoggedIn, (req, res) => {
	res.render('join', {title: 'Ontelier - Join'});
});

module.exports = router;