const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');
const mailer = require('./mail');

const router = express.Router();

router.post('/join', async (req, res, next) => {
    const { user_id, user_pwd, user_email, user_nickname, user_phone } = req.body;
    try {
        const exUser = await User.findOne({ where: { user_id }});
        if (exUser) {
            req.flash('error', '이미 존재하는 아이디입니다');
            return res.redirect('/join');
        }
        const hash = await bcrypt.hash(user_pwd, 12);

        let key_one = crypto.randomBytes(256).toString('hex').substr(100, 5);
        let key_two = crypto.randomBytes(256).toString('base64').substr(100, 5);
        let key_for_verify = key_one + key_two;

        const result = await User.create({
            user_id,
            user_pwd: hash,
            user_email,
            user_nickname,
            user_phone,
            key_for_verify,
            email_verified: 0,
        });

        if (result) {
            let url = 'http://' + req.get('host') + '/confirmEmail' + '?key=' + key_for_verify;

            let emailParam = {
                toEmail: req.user.user_email,
                subject: '온뜰 - 이메일 인증',
                text: '<h1>이메일 인증을 위해 클릭해주세요</h1><br>' + url
            };

            mailer.sendGmail(emailParam);

            res.send('<script type="text/javascript">alert("이메일을 확인해주세요"); window.location="/";</script>');
        }
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