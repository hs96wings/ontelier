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
		where: {
			category_high: {
				[Op.like]: '%' + category1 + '%'
			},
			category_low: {
				[Op.like]: '%' + category2 + '%'
			},
		},
		order: [['class_score', 'DESC']],
		limit: 5,
	});

	sale = await Class.findAll({
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
		order: [['class_discount', 'DESC']],
		limit: 5,
	});

	if (best && sale) {
		res.render('category_list', {
			title: '온뜰',
			best,
			category1,
			category2
		});
	} else {
		req.flash('error', 'DB 오류');
		res.render('error');
	}
});

router.get('/all', async (req, res, next) => {
	let category1 = req.query.category1;
	let category2 = req.query.category2;
	let sort = req.query.sort;
	let result;

	if (category1 === undefined) category1 = '';
	if (category2 === undefined) category2 = '';
	if (sort === undefined) sort = "new";

	switch (sort) {
		case "best":
			result = await Class.findAll({
				order: [['class_score', 'DESC']],
				where: {
					category_high: {
						[Op.like]: '%' + category1 + '%',
					},
					category_low: {
						[Op.like]: '%' + category2 + '%',
					},
				},
			});
			break;
		case "sale":
			result = await Class.findAll({
				order: [['class_discount', 'DESC']],
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
			});
			break;
		case "family":
			result = await Class.findAll({
				where: {
					category_high: {
						[Op.like]: '%' + category1 + '%',
					},
					category_low: {
						[Op.like]: '%' + category2 + '%',
					},
					class_family: 1,
				},
				order: [['createdAt', 'DESC']],
			});
			break;
		case 'review':
			result = await Class.findAll({
				include: [{
					model: Review,
					attributes: ['ClassId']
				}],
				group: ['ClassId'],
				order: [[sequelize.fn('COUNT', sequelize.col('ClassId')), 'DESC']],
				where: {
					category_high: {
						[Op.like]: '%' + category1 + '%',
					},
					category_low: {
						[Op.like]: '%' + category2 + '%',
					},
				},
			});
			break;
		default:
			result = await Class.findAll({
				where: {
					category_high: {
						[Op.like]: '%' + category1 + '%',
					},
					category_low: {
						[Op.like]: '%' + category2 + '%',
					},
				},
				order: [['createdAt', 'DESC']],
			});
	}
	
	if (result) {
		res.render('allview_list', {
			classes: result,
			category1,
			category2,
			sort
		});
	} else {
		req.flash('error', 'DB 오류');
		res.redirect('/');
	}
});


module.exports = router;