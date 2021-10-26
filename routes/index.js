const express = require('express');
const Conn = require('../models/conn');
const Class = require('../models/class');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Op } = require('sequelize');

const router = express.Router();

router.use((req, res, next) => {
	res.locals.user = req.user;
	next();
})

router.get('/', function(req, res, next) {
	// const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	// Conn.create({
	// 	conn_ip: ip,
	// })
	// .catch((error) => {
	// 	console.error(error);
	// });
	let popularClass;
	let saleClass;
	let newClass;
	let familyClass;

	Class.findAll({
		order: [['createdAt', 'DESC']],
		limit: 5,
	})
	.then((result) => {
		newClass = result;
	})
	.catch((error) => {
		console.error(error);
		next(error);
	})

	Class.findAll({
		order: [['class_score', 'DESC']],
		limit: 5,
	})
	.then((result) => {
		popularClass = result;
	})
	.catch((error) => {
		console.error(error);
		popularClass = newClass;
	});

	
	Class.findAll({
		order: [['class_discount', 'DESC']],
		limit: 5,
		where: {
			class_discount: {
				[Op.gt]: 0,
			},
		},
	})
	.then((result) => {
		saleClass = result;
	})
	.catch((error) => {
		console.error(error);
		saleClass = newClass;
	})

	Class.findAll({
		where: {class_family: 1},
		order: [['createdAt', 'DESC']],
		limit: 5,
	})
	.then((result) => {
		familyClass = result;
		res.render('main', {
			populars: popularClass,
			sales: saleClass,
			newes: newClass,
			familys: familyClass,
			title: '온뜰',
		});
	})
	.catch((error) => {
		console.error(error);
		res.render('main', {title: '온뜰 - DB오류'});
	});
});

router.get('/login', isNotLoggedIn, (req, res) =>  {
	res.render('login', {title: 'Ontelier - Login'});
});

router.get('/join', isNotLoggedIn, (req, res) => {
	res.render('join', {title: 'Ontelier - Join'});
});

module.exports = router;
