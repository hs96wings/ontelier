const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const Class = require('../models/class');
const Review = require('../models/review');
const sequelize = require('sequelize');
const { Op } = require('sequelize');

const router = express.Router();

router.get('/', async (req, res, next) => {
	let category1 = req.query.category1;
	let category2 = req.query.category2;
	let best;
	let sale;

	if (!category1) category1 = '';
	if (!category2) category2 = '';

	best = await Class.findAll({
		attributes: {
			include: [[sequelize.fn("COUNT", sequelize.col("Reviews.ClassId")), 'reviewCount']],
			exclude: ['class_enrolldate', 'class_family', 'class_info', 'teacher_name',
						'teacher_info', 'createdAt', 'updatedAt', 'deletedAt', 'UserUserId']
		},
		include: [{
			model: Review, attributes: []
		}],
		where: {
			category_high: {
				[Op.like]: '%' + category1 + '%'
			},
			category_low: {
				[Op.like]: '%' + category2 + '%'
			},
		},
		raw: true,
		group: ['Class.id'],
		order: [['class_score', 'DESC']],
	});

	sale = await Class.findAll({
		attributes: {
			include: [[sequelize.fn("COUNT", sequelize.col("Reviews.ClassId")), 'reviewCount']],
			exclude: ['class_enrolldate', 'class_family', 'class_info', 'teacher_name',
						'teacher_info', 'createdAt', 'updatedAt', 'deletedAt', 'UserUserId']
		},
		include: [{
			model: Review, attributes: []
		}],
		where: {
			category_high: {
				[Op.like]: '%' + category1 + '%',
			},
			category_low: {
				[Op.like]: '%' + category2 + '%',
			},
			class_discount: {
				[Op.gt]: 0,
			},
		},
		raw: true,
		group: ['Class.id'],
		order: [['class_discount', 'DESC']],
	});

	if (best && sale) {
		res.render('category_list', {
			title: '온뜰',
			best,
			sale,
			category1,
			category2,
			messages: req.flash('error')
		});
	} else {
		req.flash('error', 'DB 오류');
		res.redirect('/');
	}
});

router.get('/all', async (req, res, next) => {
	let category1 = req.query.category1;
	let category2 = req.query.category2;
	let sort = req.query.sort;
	let result;

	let where_condition;
	let order_condition;

	if (category1 === undefined) category1 = '';
	if (category2 === undefined) category2 = '';
	if (sort === undefined) sort = "new";

	switch (sort) {
		case "best":
			order_condition = [['class_score', 'DESC']];
			where_condition = {
				category_high: {
					[Op.like]: '%' + category1 + '%',
				},
				category_low: {
					[Op.like]: '%' + category2 + '%',
				},
			};
			break;
		case "sale":
			order_condition = [['class_discount', 'DESC']];
			where_condition = {
				category_high: {
					[Op.like]: '%' + category1 + '%',
				},
				category_low: {
					[Op.like]: '%' + category2 + '%',
				},
				class_discount: {
					[Op.gt]: 0,
				},
			};
			break;
		case "family":
			order_condition = [['createdAt', 'DESC']];
			where_condition = {
				category_high: {
					[Op.like]: '%' + category1 + '%',
				},
				category_low: {
					[Op.like]: '%' + category2 + '%',
				},
				class_family: 1,
			};
			break;
		default:
			order_condition = [['createdAt', 'DESC']];
			where_condition = {
				category_high: {
					[Op.like]: '%' + category1 + '%',
				},
				category_low: {
					[Op.like]: '%' + category2 + '%',
				},
			};
	}

	if (sort === 'review') {
		result = await Class.findAll({
			attributes: {
				include: [[sequelize.fn("COUNT", sequelize.col("Reviews.ClassId")), 'reviewCount']],
				exclude: ['class_enrolldate', 'class_family', 'class_info', 'teacher_name',
							'teacher_info', 'createdAt', 'updatedAt', 'deletedAt', 'UserUserId']
			},
			include: [{
				model: Review, attributes: []
			}],
			where: {
				category_high: {
					[Op.like]: '%' + category1 + '%',
				},
				category_low: {
					[Op.like]: '%' + category2 + '%',
				},
			},
			raw: true,
			group: ['Class.id'],
			order: [[sequelize.fn('COUNT', sequelize.col('Reviews.ClassId')), 'DESC']],
		});
	} else {
		result = await Class.findAll({
			attributes: {
				include: [[sequelize.fn("COUNT", sequelize.col("Reviews.ClassId")), 'reviewCount']],
				exclude: ['class_enrolldate', 'class_family', 'class_info', 'teacher_name',
							'teacher_info', 'createdAt', 'updatedAt', 'deletedAt', 'UserUserId']
			},
			include: [{
				model: Review, attributes: []
			}],
			where: where_condition,
			order: order_condition,
			raw: true,
			group: ['Class.id'],
		});
	}
	
	if (result) {
		res.render('allview_list', {
			classes: result,
			category1,
			category2,
			sort, messages: req.flash('error')
		});
	} else {
		req.flash('error', 'DB 오류');
		res.redirect('/');
	}
});


module.exports = router;