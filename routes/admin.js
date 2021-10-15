const express = require('express');
const Class = require('../models/class');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

router.get('/', isLoggedIn, (req, res) => {
	Class.findAll({
        order: [['createdAt', 'DESC']],
    })
	.then((result) => {
			res.render('list', {
			classes: result,
			user: req.user,
		});
	})
	.catch((error) => {
		console.log(error);
	});
});

router.get('/write', isLoggedIn, (req, res) => {
	res.render('write', {title: 'Ontelier'});
});

router.post('/write', isLoggedIn, (req, res) => {
	const body = req.body;

	Class.create({
		class_title: body.class_title,
		class_price: body.class_price,
		class_info: body.class_info,
		teacher_name: body.teacher_name,
		teacher_info: body.teacher_info,
	})
	.then((result) => {
		res.redirect('/admin');
	})
	.catch((error) => {
		console.log(error);
		next(error);
	});
});

router.post('/update', isLoggedIn, (req, res) => {
	const body = req.body;

	Class.update({
		class_title: body.class_title,
		class_price: body.class_price,
		class_info: body.class_info,
		teacher_name: body.teacher_name,
		teacher_info: body.teacher_info,
	}, {
		where: { id: body.id }
	})
	.then((result) => {
		console.log(result);
		res.redirect('/admin');
	})
	.catch((error) => {
		console.log(error);
		next(error);
	});
});

router.post('/delete', isLoggedIn, (req, res) => {
	const body = req.body;

	Class.destroy({
		where: { id: body.id }
	})
	.then((result) => {
		console.log(result);
		res.redirect('/admin');
	})
	.catch((error) => {
		console.log(error);
		next(error);
	});
});

router.get('/class/:id', isLoggedIn, (req, res) => {
	Class.findOne({where: { id: req.params.id }})
	.then((result) => {
		console.log(result);
		res.render('view', {title: '글 조회', class: result});
	})
	.catch((error) => {
		console.error(error);
		next(error);
	});
});

module.exports = router;
