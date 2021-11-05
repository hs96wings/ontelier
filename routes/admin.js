const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Class = require('../models/class');
const User = require('../models/user');
const Review = require('../models/review');
const Purchase = require('../models/purchase');

const { isLoggedIn, isAdmin, isSuper } = require('./middlewares');

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

router.get('/', isLoggedIn, isAdmin, (req, res) => {
	let pageNum = req.query.page;
	let offset = 0;
	let user_roll = req.user.user_roll;
	const limit = 5;
	const category = req.query.category;

	if (pageNum === undefined) pageNum = 1;
	if (pageNum > 1) {
		offset = limit * (pageNum - 1);
	}
	
	if (req.user.user_roll === 'admin') {
		if (category === undefined) {
			Class.findAndCountAll({
				offset: offset,
				limit: limit,
				order: [['createdAt', 'DESC']],
			})
			.then((result) => {
					res.render('admin_list', {
					classes: result.rows,
					user: req.user,
					pageNum: pageNum,
					pages: result.count,
					limit: limit,
					messages: req.flash('error'),
				});
			})
			.catch((error) => {
				console.error(error);
			});
		} else {
			Class.findAndCountAll({
				offset: offset,
				limit: limit,
				order: [['createdAt', 'DESC']],
				where: { category_high: category }
			})
			.then((result) => {
					res.render('admin_list', {
					classes: result.rows,
					user: req.user,
					pageNum: pageNum,
					pages: result.count,
					limit: limit,
					queryCategory: category,
				});
			})
			.catch((error) => {
				console.error(error);
			});
		}
	} else {
		res.render('admin_alluser', {
			user: req.user,
		});
	}
});

router.get('/write', isLoggedIn, isSuper, (req, res) => {
	res.render('admin_list_write', {title: 'Ontelier'});
});

router.post('/write', isLoggedIn, isSuper, upload.single('class_img'), async (req, res, next) => {
	const body = req.body;
	let filename;

	if (req.file === undefined) {
		filename = '';
	} else {
		filename = `/images/uploads/${req.file.filename}`;
	}

	Class.create({
		class_title: body.class_title,
		class_price: body.class_price,
		class_score: body.class_score,
		class_img: filename,
		class_family: body.class_family,
		category_high: body.category_high,
		category_low: body.category_low,
		class_info: body.class_info,
		teacher_name: body.teacher_name,
		teacher_info: body.teacher_info,
		class_cirriculum: body.class_cirriculum,
		class_discount: body.class_discount,
	})
	.then(() => {
		res.redirect('/admin');
	})
	.catch((error) => {
		console.error(error);
		next(error);
	});
});

router.get('/update/:id', isLoggedIn, isSuper, (req, res) => {
	Class.findOne({where: { id: req.params.id }})
	.then((result) => {
		res.render('admin_list_update', {title: '글 수정', class: result});
	})
	.catch((error) => {
		console.error(error);
		next(error);
	});
})

router.post('/update', isLoggedIn, isSuper, upload.single('class_img'), (req, res) => {
	const body = req.body;

	let filename;

	if (req.file === undefined) {
		filename = body.originalname;
	} else {
		filename = `/images/uploads/${req.file.filename}`;
	}

	Class.update({
		class_title: body.class_title,
		class_price: body.class_price,
		class_score: body.class_score,
		class_img: filename,
		class_family: body.class_family,
		category_high: body.category_high,
		category_low: body.category_low,
		class_info: body.class_info,
		teacher_name: body.teacher_name,
		teacher_info: body.teacher_info,
		class_cirriculum: body.class_cirriculum,
		class_discount: body.class_discount,
	}, {
		where: { id: body.id }
	})
	.then(() => {
		res.redirect('/admin');
	})
	.catch((error) => {
		console.error(error);
		next(error);
	});
});

router.post('/delete', isLoggedIn, isSuper, (req, res) => {
	const body = req.body;

	Class.destroy({
		where: { id: body.id }
	})
	.then(() => {
		res.redirect('/admin');
	})
	.catch((error) => {
		console.error(error);
		next(error);
	});
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
			console.log(result);
			res.render('admin_enrolluser', {users: result});
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send();
		})
	}
})

router.get('/class/:id', isLoggedIn, isSuper, (req, res) => {
	Class.findOne({where: { id: req.params.id }})
	.then((result) => {
		res.render('admin_list_view', {title: '글 조회', class: result});
	})
	.catch((error) => {
		console.error(error);
		next(error);
	});
});

router.get('/review', isLoggedIn, isSuper, (req, res) => {
	Review.findAll({
		include: {
			model: Class,
			attributes: ['class_title'],
		},
		order: [['createdAt', 'DESC']],
	})
	.then((result) => {
			console.log(result);
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

router.get('/review/write', isLoggedIn, isSuper, (req, res) => {
	res.render('admin_review_write', {title: '온뜰 - Admin - 후기'});
});

router.post('/review/write', isSuper, async (req, res, next) => {
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

router.get('/review/:id', isLoggedIn, isSuper, (req, res) => {
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
