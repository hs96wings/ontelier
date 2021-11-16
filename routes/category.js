const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const Class = require('../models/class');
const Review = require('../models/review');
const sequelize = require('sequelize');
const { Op } = require('sequelize');

const router = express.Router();

router.get('/', function(req, res, next) {
    let category = req.query.category;
	let sort = req.query.sort;

    if (category === undefined) {
        category = 'DIY/수공예';
    }

	let bestClass;
	let saleClass;
	
	if (sort === undefined) {
		Class.findAll({
			where: {
				category_high: category,
			},
			order: [['class_score', 'DESC']],
			limit: 5,
		})
		.then((result) => {
			bestClass = result;
		})
		.catch((error) => {
			console.error(error);
		});
	} else {
		Class.findAll({
			where: {
				category_high: category,
				category_low: sort,
			},
			order: [['class_score', 'DESC']],
			limit: 5,
		})
		.then((result) => {
			bestClass = result;
		})
		.catch((error) => {
			console.error(error);
		});
	}

	
	if (sort === undefined) {
		Class.findAll({
			order: [['class_discount', 'DESC']],
			limit: 5,
			where: {
				category_high: category,
				class_discount: {
					[Op.gt]: 0,
				},
			},
		})
		.then((result) => {
			saleClass = result;
			res.render('category_list', {
				title: '온뜰',
				best: bestClass,
				sale: saleClass,
				category: category,
				sort: null,
			});
		})
		.catch((error) => {
			console.error(error);
			saleClass = newClass;
		})
	} else {
		Class.findAll({
			order: [['class_discount', 'DESC']],
			limit: 5,
			where: {
				category_high: category,
				category_low: sort,
				class_discount: {
					[Op.gt]: 0,
				},
			},
		})
		.then((result) => {
			saleClass = result;
			res.render('category_list', {
				title: '온뜰',
				best: bestClass,
				sale: saleClass,
				category: category,
				sort: sort
			});
		})
		.catch((error) => {
			console.error(error);
			saleClass = newClass;
		})
	}
});

router.get('/all', async (req, res, next) => {
	let sort = req.query.sort;
	let result;
	if (sort === undefined) sort = "all";
	switch (sort) {
		case "best":
			result = await Class.findAll({order: [['class_score', 'DESC']]});
			break;
		case "new":
			result = await Class.findAll({order: [['createdAt', 'DESC']]});
			break;
		case "sale":
			result = await Class.findAll({
				order: [['class_discount', 'DESC']],
				where: {
					class_discount: {
						[Op.gt]: 0,
					},
				},
			});
			break;
		case "family":
			result = await Class.findAll({
				where: {class_family: 1},
				order: [['createdAt', 'DESC']],
			});
			break;
		case "review":
			result = await Class.findAll({
				include: [
					{
						model: Review,
						attributes: ['ClassId']
					}
				],
				group: ['ClassId'],
				order: [[sequelize.fn('COUNT', sequelize.col('ClassId')), 'DESC']],
			});
			break;
		default:
			result = await Class.findAll();
			break;
	}
	if (result) {
		res.render('allview_list', {classes: result});
	} else {
		req.flash('error', 'DB 오류');
		res.redirect('/');
	}
});


module.exports = router;