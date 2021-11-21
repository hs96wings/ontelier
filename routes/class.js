const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const Class = require('../models/class');
const Review = require('../models/review');
const Purchase = require('../models/purchase');
const Lecture = require('../models/lecture');

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


router.get('/:id', (req, res, next) => {
    Class.findOne({
        where: {id: req.params.id}
    })
    .then((result) => {
        res.render('class_view', {
            class: result,
        });
    })
    .catch((error) => {
        res.render('error');
    })
});

router.get('/:id/review', (req, res, next) => {
    Review.findAll({
        where: { ClassId: req.params.id },
        include: {
			model: Class,
			attributes: ['class_title'],
		},
    })
    .then((result) => {
        res.render('class_review', {
            reviews: result,
        });
    })
    .catch((error) => {
        res.render('error');
    })
});

router.get('/:id/review/write', isLoggedIn, async (req, res, next) => {
    let result;
    result = await Class.findOne({
        where: {
            id: req.params.id
        },
        attributes: ['id']
    });

    if (result) {
        res.render('class_review_write', {
            result: result,
        });
    } else {
        req.flash('오류');
        res.redirect('/mypage');
    }
});

router.post('/review/write', isLoggedIn, upload.single('review_img'), async (req, res) => {
	let filename;

	if (req.file === undefined) {
		filename = '';
	} else {
		filename = `/images/uploads/${req.file.filename}`;
	}
    try {
        await Review.create({
            review_score: req.body.review_score,
            review_img: filename,
            review_text: req.body.review_text,
            review_best_num: req.body.review_best_num,
            reviewer: req.user.user_nickname,
            ClassId: req.body.class_id,
            UserUserId: req.user.user_id,
        });
     
        let url = '/class/' + req.body.class_id + '/review';
        res.redirect(url);
    } catch (error) {
        req.flash('error', '오류로 인해 업로드 되지 않았습니다');
    }
});

router.get('/:id/payment', isLoggedIn, async (req, res, next) => {
    const isPurchase = await Purchase.findOne({
        where: {
            UserUserId: req.user.user_id,
            ClassId: req.params.id,
        }
    });
    if (isPurchase) {
        req.flash('error', '이미 구매한 상품입니다');
        res.redirect('/');
    } else {
        Purchase.create({
            ClassId: req.params.id,
            UserUserId: req.user.user_id,
        })
        .then(() => {
            res.redirect('/mypage');
        })
        .catch((error) => {
            req.flash('error', '구매에 실패했습니다');
            res.redirect('/');
        })
    }
});

router.get('/contents/:id', async (req, res, next) => {
    const isPurchase = await Purchase.findOne({
        where: {
            UserUserId: req.user.user_id,
            ClassId: req.params.id,
        }
    })
    if (isPurchase) {
        const isClass = await Class.findOne({
            where: {
                id: req.params.id,
            }
        });
        if (isClass) {
            Lecture.findAll({
                where: {
                    ClassId: req.params.id,
                }
            })
            .then((result) => {
                res.render('class_contents', {
                    videos: result,
                    class: isClass
                });
            })
            .catch(() => {
                req.flash('error', '강의를 불러오지 못했습니다');
                res.redirect('/mypage');
            });
        } else {
            req.flash('error', '없는 강의입니다');
            res.redirect('/mypage');
        }
    } else {
        req.flash('error', '구매하지 않은 강의입니다');
        res.redirect('/');
    }
});

module.exports = router;