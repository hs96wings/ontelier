const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => {
    const { user_id, user_pwd, user_email, user_nickname, user_phone } = req.body;
    try {
        const exUser = await User.findOne({ where: { user_id }});
        if (exUser) {
            req.flash('error', '이미 존재하는 아이디입니다');
            return res.redirect('/join');
        }
        const hash = await bcrypt.hash(user_pwd, 12);
        await User.create({
            user_id,
            user_pwd: hash,
            user_email,
            user_nickname,
            user_phone,
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/login', isNotLoggedIn, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
}));

router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

router.get('/kakao', isNotLoggedIn, passport.authenticate('kakao'));

router.get('/kakao/callback', isNotLoggedIn,  passport.authenticate('kakao', {
    failureRedirect: '/',
}), (req, res) => {
    res.redirect('/');
});

router.get('/naver', isNotLoggedIn, passport.authenticate('naver'));

router.get('/naver/callback',isNotLoggedIn,  passport.authenticate('naver', {
    failureRedirect: '/',
}), (req, res) => {
    res.redirect('/');
});

module.exports = router;