const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

const Class = require('../models/class');
const User = require('../models/user');
const Review = require('../models/review');
const Purchase = require('../models/purchase');

const { isLoggedIn, isAdmin } = require('./middlewares');

const router = express.Router();

try {
	fs.readdirSync('./public/images/uploads');
} catch (error) {
	console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다');
	fs.mkdirSync('./public/images/uploads')
}

const upload = multer({
	storage: multer.diskStorage({
		destination(req, file, cb) {
			cb(null, './public/images/uploads/');
		},
		filename(req, file, cb) {
			const ext = path.extname(file.originalname);
			cb(null, req.user.user_nickname + '_' + Date.now() + ext);
		},
	}),
	fileFilter: function (req, file, cb) {
		var ext = path.extname(file.originalname);
		if (ext !== '.png' && ext !== '.jpeg' && ext !== '.jpg' && ext !== '.gif') {
			req.flash('error', '클래스는 등록되었으나 이미지는 등록되지 않았습니다');
			cb(null, false);
		} else {
			cb(null, true);
		}
	},
	limits: { fileSize: 10 * 1024 * 1024 },
});

router.get('/', isLoggedIn, isAdmin, async (req, res) => {
	let pageNum = req.query.page;
	let filter = req.query.filter;
	let keyword = req.query.keyword;
	let offset = 0;
	const user_roll = req.user.user_roll;
	const limit = 5;
	let category = req.query.category;
	let result;

	if (pageNum === undefined) pageNum = 1;
	if (pageNum > 1) {
		offset = limit * (pageNum - 1);
	}

	if (!filter) filter = '';
	let filter_condition;
	if (!keyword) keyword = '';
	if (!category) category = '';
	
	switch (filter) {
		case 'class_price':
			filter_condition = { 
				class_price: {
					[Op.gt]: parseInt(keyword)
				},
				category_high: {
					[Op.like]: '%' + category + '%'
				}
			};
			break;
		case 'category':
			filter_condition =  {
				category_high: {
					[Op.like]: '%' + category + '%'
				},
				category_low: {
					[Op.like]: '%' + keyword + '%'
				},
			};
			break;
		case 'teacher_name':
			filter_condition = {
				category_high: {
					[Op.like]: '%' + category + '%'
				},
				teacher_name: {
					[Op.like]: '%' + keyword + '%'
				},
			};
			break;
		default:
			filter_condition = {
				category_high: {
					[Op.like]: '%' + category + '%'
				},
				class_title: {
					[Op.like]: '%' + keyword + '%'
				},
			};
	}

	if (user_roll === 'admin') {
		result = await Class.findAndCountAll({
			offset: offset,
			limit: limit,
			order: [['createdAt', 'DESC']],
			where: filter_condition,
		});
		if (result) {
			res.render('admin_list', {
				classes: result.rows,
				user: req.user,
				pageNum,
				pages: result.count,
				limit,
				keyword,
				filter,
				queryCategory: category,
				messages: req.flash('error')
			});
		} else {
			req.flash('error', 'DB 오류');
			res.redirect('/');
		}
	} else if (user_roll === 'bizz') {
		result = await Class.findAndCountAll({
			offset,
			limit,
			order: [['createdAt', 'DESC']],
			where: {
				UserUserId: req.user.user_id
			}
		});
		res.render('admin_list', {
			classes: result.rows,
			user: req.user,
			pageNum,
			pages: result.count,
			limit,
			keyword,
			filter,
			queryCategory: category,
			messages: req.flash('error')
		})
	} else {
		res.render('admin_alluser', {
			user: req.user,
		});
	}
});

router.get('/write', isLoggedIn, isAdmin, (req, res) => {
	res.render('admin_list_write', {title: 'Ontelier'});
});

router.post('/write', isLoggedIn, isAdmin, upload.single('class_img'), async (req, res, next) => {
	const {class_title, class_price, class_score, class_family, category_high, category_low, class_info, teacher_name, teacher_info, class_cirriculum, class_discount} = req.body;
	let filename;
	let result;

	if (req.file === undefined) {
		filename = '';
	} else {
		filename = `/images/uploads/${req.file.filename}`;
	}

	try {
		result = await Class.create({
			class_title, class_price, class_score,
			class_img: filename,
			class_family, category_high, category_low, class_info,
			teacher_name, teacher_info, class_cirriculum, class_discount,
			UserUserId: req.user.user_id,
		});

		res.redirect('/admin');
	} catch (error) {
		req.flash('error', 'DB 오류');
		res.redirect('/');
	}
});

router.get('/update/:id', isLoggedIn, isAdmin, async (req, res) => {
	let result = await Class.findOne({where: {id: req.params.id}});
	if (result) {
		res.render('admin_list_update', {
			title: '클래스 수정',
			class: result
		});
	} else {
		req.flash('error', 'DB 오류');
		res.redirect('/admin');
	}
});

router.post('/update', isLoggedIn, isAdmin, upload.single('class_img'), async (req, res) => {
	const body = req.body;
	const { id, class_title, class_price, class_score, class_family, category_high, category_low, class_info, teacher_name, teacher_info, class_cirriculum, class_discount} = req.body;

	let filename;

	if (req.file === undefined) {
		filename = body.originalname;
	} else {
		filename = `/images/uploads/${req.file.filename}`;
	}

	try {
		await Class.update({
			class_title, class_price, class_score,
			class_img: filename,
			class_family, category_high, category_low, class_info,
			teacher_name, teacher_info, class_cirriculum, class_discount,
		}, {
			where: {
				id,
				UserUserId: req.user.user_id,
			}
		});
	} catch (error) {
		req.flash('error', 'DB 오류');
	}
	res.redirect('/admin');
});

router.post('/delete', isLoggedIn, isAdmin, async (req, res) => {
	try {
		await Class.destroy({where: {id: req.body.id}});
	} catch (error) {
		req.flash('error', 'DB 오류');
	}
	res.redirect('/admin');
});

router.get('/alluser', isLoggedIn, isAdmin, (req, res) => {
	if (req.user.user_roll === 'admin') {
		User.findAll({
			order: [['createdAt', 'DESC']],
		})
		.then((result) => {
			res.render('admin_alluser', {users: result});
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send();
		});
	} else {
		Purchase.findOne({
			include: {
				model: Class,
				where: {teacher_name: req.user.user_nickname}
			},
		})
		.then((result) => {
			res.render('admin_enrolluser', {users: result});
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send();
		})
	}
})

router.get('/class/:id', isLoggedIn, isAdmin, (req, res) => {
	Class.findOne({where: { id: req.params.id }})
	.then((result) => {
		res.render('admin_list_view', {title: '글 조회', class: result});
	})
	.catch((error) => {
		console.error(error);
		next(error);
	});
});

router.get('/review', isLoggedIn, isAdmin, (req, res) => {
	Review.findAll({
		include: {
			model: Class,
			attributes: ['class_title'],
		},
		order: [['createdAt', 'DESC']],
	})
	.then((result) => {
			res.render('admin_review', {
			title: '온뜰',
			reviews: result,
		});
	})
	.catch((error) => {
		res.render('admin_review', {title: '온뜰'});
		console.error(error);
	});
});

router.get('/review/write', isLoggedIn, isAdmin, (req, res) => {
	res.render('admin_review_write', {title: '온뜰 - Admin - 후기'});
});

router.post('/review/write', isLoggedIn, isAdmin, async (req, res, next) => {
	const body = req.body;
	const user_nickname = req.user.user_nickname;
	const user_id = req.user.user_id;

	Review.create({
		review_score: body.review_score,
		review_best_num: body.review_best_num,
		review_text: body.review_text,
		reviewer: user_nickname,
		UserUserId: user_id,
		ClassId: 1,
	})
	.then(() => {
		res.redirect('/admin/review');
	})
	.catch((error) => {
		console.error(error);
		next(error);
	});
});

router.get('/review/:id', isLoggedIn, isAdmin, (req, res) => {
	Review.findOne({
		where: { id: req.params.id },
		include: {
			model: Class,
			attributes: ['class_title'],
		}
	})
	.then((result) => {
		res.render('admin_review_view', {title: '후기 조회', review: result});
	})
	.catch((error) => {
		console.error(error);
		next(error);
	});
});

module.exports = router;
