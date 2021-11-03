const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/class');
const Class = require('../models/class');

const router = express.Router();

router.get('/', isLoggedIn, (req, res, next) => {
    Class.findAll()
    .then((result) => {
        res.render('mypage', {
            title: '온뜰 - mypage',
            classes: result,
        });
    })
    .catch((error) => {
        res.render('mypage', {title: '온뜰 - mypage'});
    });
});

router.get('/edit', isLoggedIn, (req, res, next) => {
    res.render('userinfo_update', {title: '온뜰 - mypage 수정'});
});

module.exports = router;