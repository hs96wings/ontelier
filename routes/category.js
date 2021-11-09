const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const Class = require('../models/class');
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
				category: category_high,
				sort: category_low
			});
		})
		.catch((error) => {
			console.error(error);
			saleClass = newClass;
		})
	}
});

router.get('/all', (req, res, next) => {
	Class.findAll()
	.then((result) => {
		res.render('allview_list', {
			title: '온뜰 - 전체보기',
			classes: result,
		});
	})
	.catch((error) => {
		console.error(error);
		res.render('allview_list', {title: '온뜰 - 전체보기'});
	});
});


module.exports = router;