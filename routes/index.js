const express = require('express');
const Class = require('../models/class');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Op } = require('sequelize');
const Review = require('../models/review');
const sequelize = require('sequelize');

const router = express.Router();

router.use((req, res, next) => {
	res.locals.user = req.user;
	next();
})

router.get('/', function(req, res, next) {
	let bestClass;
	let saleClass;
	let newClass;
	let familyClass;
	let reviewClass;

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
		bestClass = result;
	})
	.catch((error) => {
		console.error(error);
		bestClass = newClass;
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
	});

	// SELECT class_title FROM classes INNER JOIN reviews ON classes.id = reviews.ClassId GROUP BY classes.id ORDER BY COUNT(classes.id) DESC;
	Class.findAll({
		include: [
			{
				model: Review,
				attributes: ['ClassId']
			}
		],
		group: ['ClassId'],
		order: [[sequelize.fn('COUNT', sequelize.col('ClassId')), 'DESC']],
	})
	.then((result) => {
		reviewClass = result;
	})
	.catch((error) => {
		console.error(error);
		reviewClass = newClass;
	});

	Class.findAll({
		where: {class_family: 1},
		order: [['createdAt', 'DESC']],
		limit: 5,
	})
	.then((result) => {
		familyClass = result;
		res.render('main', {
			best: bestClass,
			sale: saleClass,
			newes: newClass,
			family: familyClass,
			reviews: reviewClass,
			title: '온뜰',
			messages: req.flash('error'),
		});
	})
	.catch((error) => {
		console.error(error);
		res.render('main', {title: '온뜰 - DB오류'});
	});
});

router.get('/login', isNotLoggedIn, (req, res) =>  {
	res.render('login', {title: '온뜰 - 로그인', messages: req.flash('error')});
	// res.render('login', {title: '온뜰 - 로그인'});
});

router.get('/join', isNotLoggedIn, (req, res) => {
	res.render('join', {title: '온뜰 - 회원가입', messages: req.flash('error')});
});

router.get('/search', (req, res, next) => {
	Class.findAll({
		where: {
			'class_title': {
				[Op.like]: '%' + req.query.title + '%',
			},
		},
	})
	.then((result) => {
		res.render('search', {title: '온뜰 - 검색결과', classes: result});
	})
	.catch((error) => {
		next(error);
	});
});

module.exports = router;