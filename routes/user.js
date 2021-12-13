const express = require('express');
const { isLoggedIn } = require('./middlewares');
const User = require('../models/user');
const Class = require('../models/class');
const Purchase = require('../models/purchase');
const Review = require('../models/review');
const Wishlist = require('../models/wishlist');
const sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Thumbsup = require('../models/thumbsup');

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
            messages: req.flash('error'),
        });
    } else {
        req.flash('error', 'DB 오류');
        res.redirect('/');
    }
})

router.get('/edit', isLoggedIn, (req, res, next) => {
    res.render('userinfo_update', {user: req.user, messages: req.flash('error'),});
});

router.post('/update', isLoggedIn, upload.single('user_profile_url'), async (req, res, next) => {
    const {user_pwd, user_pwd_change, user_email, user_nickname, user_phone } = req.body;

    let filename;
    let mode;

	if (req.file === undefined) {
		filename = req.body.originalname;
	} else {
		filename = `/images/uploads/${req.file.filename}`;
	}

    let pwdExp = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[$`~!@#$%^&*?\\(\\)\-_=+]).{8,16}$/;
    if (user_pwd_change !== '' && user_pwd_change.length > 0) {
        if (!pwdExp.test(user_pwd_change)) {
            req.flash('error', '변경할 비밀번호가 형식에 맞지 않습니다');
            return res.redirect('/mypage/edit');
        } else {
            mode = 'pwd_change';
        }
    } else {
        mode = 'pwd_no_change';
    }

    let nickExp = /^[a-zA-Zㄱ-힣][a-zA-Zㄱ-힣]{1,9}$/;
    if (!nickExp.test(user_nickname)) {
        req.flash('error', '닉네임을 확인해주세요');
        return res.redirect('/mypage/edit');
    }

    let emailExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    if (!emailExp.test(user_email)) {
        req.flash('error', '이메일을 확인해주세요');
        return res.redirect('/mypage/edit');
    }

    const exUser = await User.findOne({ where: { user_id: req.user.user_id }});
    if (exUser) {
        const result = await bcrypt.compare(user_pwd, exUser.user_pwd);
        if (result) {
            switch (mode) {
                case 'pwd_change':
                    try {
                        const hash = await bcrypt.hash(user_pwd_change, 12);
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
                    } catch (error) {
                        req.flash('error', '오류가 발생했습니다');
                        return res.redirect('/mypage/edit');
                    }
                default:
                    try {
                        await User.update({
                            user_email,
                            user_nickname,
                            user_phone,
                            user_profile_url: filename,
                        }, {
                            where: {
                                user_id: req.user.user_id,
                            }
                        });
                    } catch (error) {
                        req.flash('error', '오류가 발생했습니다');
                        return res.redirect('/mypage/edit');
                    }
            }
            req.flash('error', '변경 완료');
            return res.redirect('/mypage');
        } else {
            req.flash('error', '비밀번호가 맞지 않습니다');
            return res.redirect('/mypage/edit');
        }
    } else {
        req.flash('error', '오류가 발생했습니다');
        return res.redirect('/mypage/edit');
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
    const myWishlist = await Class.findAll({
        include: {
            model: Wishlist,
            where: {
                UserUserId: req.user.user_id,
            }
        },
    });
    if (myWishlist) {
        res.render('my_wishlist', {classes: myWishlist});
    } else {
        throw { status: 'fail', message: 'DB 오류'};
    }
});

router.get('/getWishlist', isLoggedIn, async (req, res, next) => {
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

router.get('/thumbsup', isLoggedIn, async (req, res, next) => {
    const myThumbsup = await Thumbsup.findAll({
        where: {
            UserUserId: req.user.user_id,
        }
    });
    if (myThumbsup) {
        res.send({status: 'success', Thumbs_data: myThumbsup});
    } else {
        throw { status: 'fail', message: 'DB 오류'};
    }
});

router.get('/purchase', isLoggedIn, async (req, res, next) => {
    const classes = await Class.findAll({
        include: {
            model: Purchase,
            where: {
                UserUserId: req.user.user_id,
            }
        }
    });
    if (classes) {
        res.render('my_purchase', {title: '온뜰', classes, messages: req.flash('error'),})
    } else {
        req.flash('error', 'DB 오류');
        res.redirect('/mypage');
    }
})

module.exports = router;