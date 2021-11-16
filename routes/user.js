const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/class');
const Class = require('../models/class');
const Purchase = require('../models/purchase');
const Review = require('../models/review');
const Wishlist = require('../models/wishlist');
const moment = require('moment');

const router = express.Router();

// router.get('/', isLoggedIn, (req, res, next) => {
//     Class.findAll({
//         include: {
//             model: Purchase,
//             where: {UserUserId: req.user.user_id}
//         },
//     })
//     .then((result) => {
//         res.render('mypage', {
//             title: '온뜰 - Mypage',
//             classes: result,
//         });
//     })
//     .catch((error) => {
//         req.flash('error', '오류가 발생했습니다');
//         res.redirect('/');
//     });
// });

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
    res.render('userinfo_update', {title: '온뜰 - mypage 수정'});
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
    const myWishlist = await Wishlist.findAll({where: {UserUserId: req.user.user_id}});
    if (myWishlist) {
        res.json(myWishlist);
    } else {
        req.flash('error', 'DB 오류');
        res.redirect('/mypage');
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