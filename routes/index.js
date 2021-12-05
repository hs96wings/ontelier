const express = require('express');
const Class = require('../models/class');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Op } = require('sequelize');
const Review = require('../models/review');
const crypto = require('crypto');
const sequelize = require('sequelize');
const mailer = require('./mail');

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

	reviewClass = await Class.findAll({
		include: [{
			model: Review,
			attributes: ['ClassId']
		}],
		group: ['ClassId'],
		order: [[sequelize.fn('COUNT', sequelize.col('ClassId')), 'DESC']],
	});

	if (bestClass && saleClass && newClass && familyClass) {
		res.render('main', {
			best: bestClass,
			sale: saleClass,
			newes: newClass,
			family: familyClass,
			reviews: reviewClass,
			messages: req.flash('error'),
		});
	} else {
		req.flash('error', 'DB 오류');
		res.status(500).send();
	}
});

router.post('/mail/:id', async (req, res) => {
	const result = await Class.findOne({
		where: {
			id: req.params.id,
		}
	});
	if (result) {
		let emailParam = {
			toEmail: req.user.user_email,
			subject: '온뜰에서 강의를 구매하셨습니다',
			text: req.user.user_nickname + ' 회원님! ' + result.class_title + ' 강의 구매가 완료되었습니다'
		};
	
		mailer.sendGmail(emailParam);
	}
})

router.get('/login', isNotLoggedIn, (req, res) =>  {
	res.render('login', { messages: req.flash('error') });
});

router.get('/join', isNotLoggedIn, (req, res) => {
	res.render('join', { messages: req.flash('error') });
});

router.get('/search', async (req, res, next) => {
	let result = await Class.findAll({
		where: {
			'class_title': {
				[Op.like]: '%' + req.query.title + '%',
			},
		},
	});

	if (result) {
		let title = req.query.title + '" 검색결과';
		res.render('search', {title, classes: result, messages: req.flash('error')});
	} else {
		req.flash('error', 'DB 오류');
		res.redirect('/');
	}
});

module.exports = router;