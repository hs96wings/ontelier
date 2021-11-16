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
});

router.get('/', async (req, res, next) => {
	let bestClass;
	let saleClass;
	let newClass;
	let familyClass;
	let reviewClass;
	
	bestClass = await Class.findAll({
		order: [['class_score', 'DESC']],
		limit: 5,
	});

	saleClass = await Class.findAll({
		order: [['class_discount', 'DESC']],
		limit: 5,
		where: {
			class_discount: {
				[Op.gt]: 0,
			},
		},
	});

	newClass = await Class.findAll({
		order: [['createdAt', 'DESC']],
		limit: 5,
	});

	familyClass = await Class.findAll({
		where: {class_family: 1},
		order: [['createdAt', 'DESC']],
		limit: 5,
	});

	// SELECT class_title FROM classes INNER JOIN reviews ON classes.id = reviews.ClassId GROUP BY classes.id ORDER BY COUNT(classes.id) DESC;
	reviewClass = await Class.findAll({
		include: [
			{
				model: Review,
				attributes: ['ClassId']
			}
		],
		group: ['ClassId'],
		order: [[sequelize.fn('COUNT', sequelize.col('ClassId')), 'DESC']],
	});

	if (bestClass && saleClass && newClass && familyClass && reviewClass) {
		res.render('main', {
			best: bestClass,
			sale: saleClass,
			newes: newClass,
			family: familyClass,
			reviews: reviewClass,
			title: '온뜰',
			messages: req.flash('error'),
		});
	} else {
		req.flash('error', 'DB 오류');
		res.status(500).send();
	}
})

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