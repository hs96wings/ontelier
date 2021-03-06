const express = require('express');
const Class = require('../models/class');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Op } = require('sequelize');
const Review = require('../models/review');
const sequelize = require('sequelize');
const mailer = require('./mail');
const { User } = require('../models');

const router = express.Router();

router.use((req, res, next) => {
	res.locals.user = req.user;
	next();
});

router.get('/', async (req, res, next) => {
	req.session.returnTo = req.originalUrl;

	let bestClass;
	let saleClass;
	let newClass;
	let familyClass;
	let reviewClass;
	
	bestClass = await Class.findAll({
		attributes: {
			include: [[sequelize.fn("COUNT", sequelize.col("Reviews.ClassId")), 'reviewCount']],
			exclude: ['class_enrolldate', 'class_family', 'class_info', 'teacher_name',
						'teacher_info', 'createdAt', 'updatedAt', 'deletedAt', 'UserUserId']
		},
		include: [{
			model: Review, attributes: []
		}],
		raw: true,
		group: ['Class.id'],
		order: [['class_score', 'DESC']],
	});

	saleClass = await Class.findAll({
		attributes: {
			include: [[sequelize.fn("COUNT", sequelize.col("Reviews.ClassId")), 'reviewCount']],
			exclude: ['class_enrolldate', 'class_family', 'class_info', 'teacher_name',
						'teacher_info', 'createdAt', 'updatedAt', 'deletedAt', 'UserUserId']
		},
		include: [{
			model: Review, attributes: []
		}],
		where: {
			class_discount: {
				[Op.gt]: 0,
			},
		},
		raw: true,
		group: ['Class.id'],
		order: [['class_discount', 'DESC']],
	});

	newClass = await Class.findAll({
		attributes: {
			include: [[sequelize.fn("COUNT", sequelize.col("Reviews.ClassId")), 'reviewCount']],
			exclude: ['class_enrolldate', 'class_family', 'class_info', 'teacher_name',
						'teacher_info', 'createdAt', 'updatedAt', 'deletedAt', 'UserUserId']
		},
		include: [{
			model: Review, attributes: []
		}],
		raw: true,
		group: ['Class.id'],
		order: [['createdAt', 'DESC']],
	});

	familyClass = await Class.findAll({
		attributes: {
			include: [[sequelize.fn("COUNT", sequelize.col("Reviews.ClassId")), 'reviewCount']],
			exclude: ['class_enrolldate', 'class_family', 'class_info', 'teacher_name',
						'teacher_info', 'createdAt', 'updatedAt', 'deletedAt', 'UserUserId']
		},
		include: [{
			model: Review, attributes: []
		}],
		where: {class_family: 1},
		raw: true,
		group: ['Class.id'],
		order: [['createdAt', 'DESC']],
	});

	reviewClass = await Class.findAll({
		attributes: {
			include: [[sequelize.fn("COUNT", sequelize.col("Reviews.ClassId")), 'reviewCount']],
			exclude: ['class_enrolldate', 'class_family', 'class_info', 'teacher_name',
						'teacher_info', 'createdAt', 'updatedAt', 'deletedAt', 'UserUserId']
		},
		include: [{
			model: Review, attributes: []
		}],
		raw: true,
		group: ['Class.id'],
		order: [[sequelize.fn('COUNT', sequelize.col('Reviews.ClassId')), 'DESC']],
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
		req.flash('error', 'DB ??????');
		res.status(500).send();
	}
});

router.post('/mail/:id', async (req, res) => {
	const result = await Class.findOne({
		where: {
			id: req.params.id,
		}
	});

	var emailExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
	if (emailExp.test(req.user.user_email)) {
		if (result) {
			let emailParam = {
				toEmail: req.user.user_email,
				subject: '???????????? ????????? ?????????????????????',
				text: req.user.user_nickname + ' ?????????! ' + result.class_title + ' ?????? ????????? ?????????????????????'
			};
		
			mailer.sendGmail(emailParam);
		}
	}
});

router.get('/confirmEmail', isNotLoggedIn, async (req, res) => {
	const key = req.query.key;
	const exKey = await User.findOne({
		where: {
			key_for_verify: key,
		}
	});

	if (exKey && key.length > 0) {
		if (!exKey.email_verified) {
			try {
				await User.update({
					email_verified: 1,
				}, {
					where: {
						key_for_verify: key,
					}
				});

				req.flash('error', '?????? ??????!');
				return res.redirect('/login');
			} catch (error) {
				console.error(error);
				req.flash('error', '????????? ??????????????????');
				return res.redirect('/');
			}
		} else {
			req.flash('error', '?????? ????????? ??????????????????');
			return res.redirect('/');
		}
	} else {
		req.flash('error', '????????? ???????????????');
		return res.redirect('/');
	}
});

router.get('/login', isNotLoggedIn, (req, res) =>  {
	res.render('login', { messages: req.flash('error') });
});

router.get('/join', isNotLoggedIn, (req, res) => {
	res.render('join', { messages: req.flash('error') });
});

router.get('/reset', isNotLoggedIn, (req, res) => {
	res.render('reset', { message: req.flash('error') });
});

router.get('/resetPwd', isNotLoggedIn, async (req, res) => {
	const key = req.query.key;

	const exKey = await User.findOne({
		where: {
			key_for_verify: key,
		}
	});

	if (exKey && key.length > 0) {
		res.render('resetPwd', {
			messages: req.flash('error'),
			user_nickname: exKey.user_nickname,
			user_email: exKey.user_email
		});
	} else {
		req.flash('error', '????????? ???????????????');
		return res.redirect('/');
	}
})

router.get('/search', async (req, res, next) => {
	req.session.returnTo = req.originalUrl;

	let result = await Class.findAll({
		attributes: {
			include: [[sequelize.fn("COUNT", sequelize.col("Reviews.ClassId")), 'reviewCount']],
			exclude: ['class_enrolldate', 'class_family', 'class_info', 'teacher_name',
						'teacher_info', 'createdAt', 'updatedAt', 'deletedAt', 'UserUserId']
		},
		include: [{
			model: Review, attributes: []
		}],
		where: {
			'class_title': {
				[Op.like]: '%' + req.query.title + '%',
			},
		},
		raw: true,
		group: ['Class.id'],
	});

	if (result) {
		if (result.length > 0) {
			let title = req.query.title + '" ????????????';
			res.render('search', {title, classes: result, messages: req.flash('error')});
		} else {
			req.flash('error', '?????? ????????? ????????????');
			res.redirect('/');
		}
	} else {
		req.flash('error', 'DB ??????');
		res.redirect('/');
	}
});

module.exports = router;