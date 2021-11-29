const express = require('express');
const { isLoggedIn } = require('./middlewares');
const User = require('../models/user');
const Class = require('../models/class');
const Purchase = require('../models/purchase');
const Review = require('../models/review');
const Wishlist = require('../models/wishlist');

const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
			req.flash('error', '수정되었으나 이미지는 등록되지 않았습니다');
			cb(null, false);
		} else {
			cb(null, true);
		}
	},
	limits: { fileSize: 10 * 1024 * 1024 },
});

router.get('/', isLoggedIn, async (req, res) => {
    const purchases = await Class.findAndCountAll({
        include: {
            model: Purchase,
            where: {UserUserId: req.user.user_id}
        },
    });
    if (purchases) {
        let wishlist_num = await Wishlist.count({where: {UserUserId: req.user.user_id}});
        let review_num = await Review.count({where: {UserUserId: req.user.user_id}});
        if (!wishlist_num) wishlist_num = 0;
        if (!review_num) review_num = 0;
        res.render('mypage', {
            title: '온뜰 - Mypage',
            classes: purchases.rows,
            purchase_num: purchases.count,
            wishlist_num: wishlist_num,
            review_num: review_num,
        });
    } else {
        req.flash('error', 'DB 오류');
        res.redirect('/');
    }
})

router.get('/edit', isLoggedIn, (req, res, next) => {
    res.render('userinfo_update', {user: req.user});
});

router.post('/update', isLoggedIn, upload.single('user_profile_url'), async (req, res, next) => {
    const {user_pwd, user_email, user_nickname, user_phone } = req.body;

    let filename;

	if (req.file === undefined) {
		filename = req.body.originalname;
	} else {
		filename = `/images/uploads/${req.file.filename}`;
	}

    try {
        const hash = await bcrypt.hash(user_pwd, 12);
        await User.update({
            user_pwd: hash,
            user_email,
            user_nickname,
            user_phone,
            user_profile_url: filename,
        }, {
            where: {
                user_id: req.user.user_id,
            }
        });
        return res.redirect('/mypage');
    } catch (error) {
        console.error(error);
        req.flash('error', 'DB 오류');
        return res.redirect('/');
    }
});

router.get('/reviews', isLoggedIn, async (req, res, next) => {
    const myReview = await Review.findAll({where: {UserUserId: req.user.user_id}});
    if (myReview) {
        res.json(myReview);
    } else {
        req.flash('error', 'DB 오류');
        res.redirect('/mypage');
    }
});

router.get('/wishlist', isLoggedIn, async (req, res, next) => {
    const myWishlist = await Wishlist.findAll({
        where: {
            UserUserId: req.user.user_id,
        }
    });
    if (myWishlist) {
        res.send({status: 'success', Wish_data: myWishlist});
    } else {
        throw { status: 'fail', message: 'DB 오류'};
    }
});

router.get('/purchase', isLoggedIn, async (req, res, next) => {
    const myPurchase = await Purchase.findAll({where: {UserUserId: req.user.user_id}});
    if (myPurchase) {
        res.json(myPurchase);
    } else {
        req.flash('error', 'DB 오류');
        res.redirect('/mypage');
    }
})

module.exports = router;