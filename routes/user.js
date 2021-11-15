const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/class');
const Class = require('../models/class');
const Purchase = require('../models/purchase');

const router = express.Router();

router.get('/', isLoggedIn, (req, res, next) => {
    Class.findAll({
        include: {
            model: Purchase,
            where: {UserUserId: req.user.user_id}
        },
    })
    .then((result) => {
        res.render('mypage', {
            title: '온뜰 - Mypage',
            classes: result,
        });
    })
    .catch((error) => {
        req.flash('error', '오류가 발생했습니다');
        res.redirect('/');
    });
});

router.get('/edit', isLoggedIn, (req, res, next) => {
    res.render('userinfo_update', {title: '온뜰 - mypage 수정'});
});

module.exports = router;