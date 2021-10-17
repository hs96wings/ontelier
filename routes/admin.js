const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

const Class = require('../models/class');
const User = require('../models/user');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

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

router.get('/', isLoggedIn, (req, res) => {
	if (req.user.user_roll !== 'admin') {
		return res.redirect(`/?loginError=권한이 없습니다`);
	}
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
	if (req.user.user_roll !== 'admin') {
		return res.redirect(`/?loginError=권한이 없습니다`);
	}
	res.render('write', {title: 'Ontelier'});
});

router.post('/write', isLoggedIn, upload.single('class_img'), async (req, res, next) => {
	console.log(req.file);
	const body = req.body;

	Class.create({
		class_title: body.class_title,
		class_price: body.class_price,
		class_info: body.class_info,
		teacher_name: body.teacher_name,
		teacher_info: body.teacher_info,
		class_img: `/images/uploads/${req.file.filename}`,
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
	if (req.user.user_roll !== 'admin') {
		return res.redirect(`/?loginError=권한이 없습니다`);
	}
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
	if (req.user.user_roll !== 'admin') {
		return res.redirect(`/?loginError=권한이 없습니다`);
	}
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

router.get('/alluser', isLoggedIn, (req, res) => {
	if (req.user.user_roll !== 'admin') {
		return res.redirect(`/?loginError=권한이 없습니다`);
	}
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

router.get('/class/:id', isLoggedIn, (req, res) => {
	if (req.user.user_roll !== 'admin') {
		return res.redirect(`/?loginError=권한이 없습니다`);
	}
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
