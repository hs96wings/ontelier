const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Class = require('../models/class');
const User = require('../models/user');
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
			cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
		},
	}),
	limits: { fileSize: 10 * 1024 * 1024 },
});

router.get('/', isLoggedIn, isAdmin, (req, res) => {
	let pageNum = req.query.page;
	let offset = 0;
	const limit = 5;
	const category = req.query.category;

	console.log(`pageNum:${pageNum}`);
	if (pageNum === undefined) pageNum = 1;
	if (pageNum > 1) {
		offset = limit * (pageNum - 1);
	}

	if (category === undefined) {
		Class.findAndCountAll({
			offset: offset,
			limit: limit,
			order: [['createdAt', 'DESC']],
		})
		.then((result) => {
			console.log(result);
				res.render('list', {
				classes: result.rows,
				user: req.user,
				pageNum: pageNum,
				pages: result.count,
				limit: limit
			});
		})
		.catch((error) => {
			console.log(error);
		});
	} else {
		Class.findAndCountAll({
			offset: offset,
			limit: limit,
			order: [['createdAt', 'DESC']],
			where: { category }
		})
		.then((result) => {
			console.log(result);
				res.render('list', {
				classes: result.rows,
				user: req.user,
				pageNum: pageNum,
				pages: result.count,
				limit: limit,
				queryCategory: category,
			});
		})
		.catch((error) => {
			console.log(error);
		});
	}
});

router.get('/write', isLoggedIn, isAdmin, (req, res) => {
	res.render('write', {title: 'Ontelier'});
});

router.post('/write', isLoggedIn, isAdmin, upload.single('class_img'), async (req, res, next) => {
	console.log(req.body);
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
		category: body.category,
		class_info: body.class_info,
		teacher_name: body.teacher_name,
		teacher_info: body.teacher_info,
		class_img: filename,
	})
	.then((result) => {
		res.redirect('/admin');
	})
	.catch((error) => {
		console.log(error);
		next(error);
	});
});

router.get('/update/:id', isLoggedIn, isAdmin, (req, res) => {
	Class.findOne({where: { id: req.params.id }})
	.then((result) => {
		console.log(result);
		res.render('update', {title: '글 수정', class: result});
	})
	.catch((error) => {
		console.error(error);
		next(error);
	});
})

router.post('/update', isLoggedIn, isAdmin, (req, res) => {
	const body = req.body;

	Class.update({
		class_title: body.class_title,
		class_price: body.class_price,
		category: body.category,
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

router.post('/delete', isLoggedIn, isAdmin, (req, res) => {
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

router.get('/alluser', isLoggedIn, isAdmin, (req, res) => {
	User.findAll({
        order: [['createdAt', 'DESC']],
    })
	.then((result) => {
		res.render('alluser', {users: result});
	})
	.catch((error) => {
		console.log(error);
	});
})

router.get('/class/:id', isLoggedIn, isAdmin, (req, res) => {
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
