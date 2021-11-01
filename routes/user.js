const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/class');

const router = express.Router();

router.get('/', isLoggedIn, (req, res, next) => {
    res.render('mypage', {title: '온뜰 - mypage'});
});

module.exports = router;