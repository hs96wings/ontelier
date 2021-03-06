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
const { Cirriculum } = require('../models');

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
	let limit = 5;
	let category = req.query.category;
	let roll_condition = req.user.user_roll === 'admin' ? '%%' : req.user.user_id;

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
				},
				UserUserId: {
					[Op.like]: roll_condition
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
				UserUserId: {
					[Op.like]: roll_condition
				}
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
				UserUserId: {
					[Op.like]: roll_condition
				}
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
				UserUserId: {
					[Op.like]: roll_condition
				}
			};
	}

	const result = await Class.findAndCountAll({
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
			title: '온뜰 - 관리자 페이지',
			messages: req.flash('error')
		});
	} else {
		req.flash('error', '검색 결과 없음');
		res.redirect('/admin');
	}
});

router.get('/write', isLoggedIn, isAdmin, (req, res) => {
	res.render('admin_list_write', {title: '온뜰 - 클래스 추가', messages: req.flash('error')});
});

router.post('/write', isLoggedIn, isAdmin, upload.single('class_img'), async (req, res, next) => {
	const {class_title, class_price, class_family, category_high, category_low, class_info, teacher_name, teacher_info, class_discount} = req.body;
	let filename;
	let result;

	if (req.file === undefined) {
		filename = '';
	} else {
		filename = `/images/uploads/${req.file.filename}`;
	}

	try {
		result = await Class.create({
			class_title, class_price, class_score: 0,
			class_img: filename,
			class_family, category_high, category_low, class_info,
			teacher_name, teacher_info, class_discount,
			UserUserId: req.user.user_id,
		});

		res.redirect('/admin');
	} catch (error) {
		req.flash('error', 'DB 오류');
		res.redirect('/');
	}
});

router.get('/update/:id', isLoggedIn, isAdmin, async (req, res) => {
	const roll_condition = req.user.user_roll === 'admin' ? '%%' : req.user.user_id;
	const result = await Class.findOne({
		where: {
			id: req.params.id,
			UserUserId: {
				[Op.like]: roll_condition
			}
		}
	});
	if (result) {
		res.render('admin_list_update', {
			title: '온뜰 - 클래스 수정',
			class: result,
			messages: req.flash('error'),
		});
	} else {
		req.flash('error', '다른 사람의 강의는 수정할 수 없습니다');
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
			where: { id }
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

router.get('/alluser', isLoggedIn, isAdmin, async (req, res) => {
	let result;

	if (req.user.user_roll === 'admin') {
		result = await User.findAll({
			order: [['createdAt', 'DESC']],
		});	
	} else {
		result = await User.findAll({
			attributes: ['user_id', 'user_email', 'user_nickname', 'user_enrolldate', 'provider'],
			include: {
				model: Purchase,
				attributes: ['ClassId', 'UserUserId'],
				required: true,
				include: [{model: Class, required: true}],
			},
		});
	}

	if (result) {
		res.render('admin_alluser', {title: '온뜰 - 유저보기', users: result, messages: req.flash('error')});
	} else {
		req.flash('error', 'DB 오류');
		res.redirect('/admin');
	}
});

router.get('/class/:id', isLoggedIn, isAdmin, async (req, res) => {
	const roll_condition = req.user.user_roll === 'admin' ? '%%' : req.user.user_id;
	const result = await Class.findOne({
		where: {
			id: req.params.id,
			UserUserId: {
				[Op.like]: roll_condition
			}
		}
	});
	if (result) {
		res.render('admin_list_view', {title: '온뜰 - 클래스 조회', class: result, messages: req.flash('error')});
	} else {
		req.flash('error', '다른 사람의 강의는 볼 수 없습니다');
		res.redirect('/admin');
	}
});

router.get('/review', isLoggedIn, isAdmin, async (req, res) => {
	const roll_condition = req.user.user_roll === 'admin' ? '%%' : req.user.user_id;

	const result = await Review.findAll({
		include: {
			model: Class,
			attributes: ['class_title'],
			where: {
				UserUserId: {
					[Op.like]: roll_condition
				},
			},
		},
		order: [['createdAt', 'DESC']],
	});
	if (result) {
		res.render('admin_review', {
			title: '온뜰 - 후기',
			reviews: result,
			messages: req.flash('error')
		});
	} else {
		req.flash('error', 'DB 오류');
		res.redirect('/admin');
	}
});

router.get('/review/:id', isLoggedIn, isAdmin, async (req, res) => {
	let result = await Review.findOne({
		where: { id: req.params.id },
		include: {
			model: Class,
			attributes: ['class_title'],
		}
	});

	if (result) {
		res.render('admin_review_view', {title: '온뜰 - 후기 조회', review: result, messages: req.flash('error')});
	} else {
		req.flash('error', 'DB 오류');
		res.redirect('/admin');
	}
});

router.get('/cirriculum/:id', isLoggedIn, isAdmin, async (req, res) => {
	const roll_condition = req.user.user_roll === 'admin' ? '%%' : req.user.user_id;
	const result = await Class.findOne({
		where: {
			id: req.params.id,
			UserUserId: {
				[Op.like]: roll_condition
			}
		}
	});

	const cirriculum = await Cirriculum.findAll({
		where: {
			ClassId: req.params.id,
		},
		order: [['id', 'ASC']]
	});

	if (result) {
		res.render('admin_cirriculum', {title: '온뜰 - 커리큘럼 추가', messages: req.flash('error'), cirriculum, id: result.id});
	} else {
		req.flash('error', '다른 사람의 강의는 볼 수 없습니다');
		res.redirect('/admin');
	}
});

router.post('/cirriculum/:id/write', isLoggedIn, isAdmin, async (req, res) => {
	const { depth, cir_text, video_url } = req.body;
	try {
		await Cirriculum.create({
			depth,
			cirriculum_text: cir_text,
			video_url,
			ClassId: req.params.id
		});
		
		return res.redirect('/admin/cirriculum/' + req.params.id);
	} catch(error) {
		console.error(error);
		req.flash('error', '오류!');
		return res.redirect('/admin/class/' + req.params.id);
	}
})

module.exports = router;
