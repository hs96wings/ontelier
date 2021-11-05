const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const Class = require('../models/class');
const { Op } = require('sequelize');

const router = express.Router();

router.get('/', function(req, res, next) {
    let category = req.query.category;

    if (category === undefined) {
        category = 'DIY/수공예';
    }

	let bestClass;
	let saleClass;
	
    Class.findAll({
		where: {category_high: category},
        order: [['class_score', 'DESC']],
		limit: 5,
	})
	.then((result) => {
		bestClass = result;
	})
	.catch((error) => {
		console.error(error);
	});

	
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