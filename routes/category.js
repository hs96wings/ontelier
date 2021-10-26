const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const Class = require('../models/class');

const router = express.Router();

router.get('/', function(req, res, next) {
    let category = req.query.category;

    if (category === undefined) {
        category = 'DIY/수공예';
    }

    Class.findAll({
        where: {category_high: category},
		order: [['createdAt', 'DESC']],
	})
	.then((result) => {
			res.render('category_list', {
			classes: result,
		});
	})
	.catch((error) => {
		res.render('main', {title: '온뜰'});
		console.error(error);
	});
});


module.exports = router;