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
            const message = encodeURIComponent('이미 존재하는 아이디입니다');
            res.redirect(`/?error=${message}`);
        }
        const hash = await bcrypt.hash(user_pwd, 12);
        await User.create({
            user_id,
            user_pwd: hash,
            user_email,
            user_nickname,
            user_phone,
        });
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            next(authError);
        }
        if (!user) {
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        });
    }) (req, res, next);
});

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