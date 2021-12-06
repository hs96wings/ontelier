const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');
const mailer = require('./mail');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res) => {
    const { user_id, user_pwd, user_email, user_nickname, user_phone } = req.body;
    const exUser = await User.findOne({where: {user_id}});

    if (exUser) {
        return res.send({ status: 'error', message: '이미 존재하는 아이디입니다' });
    } else {
        let key_one = crypto.randomBytes(256).toString('hex').substr(100, 5);
        let key_two = crypto.randomBytes(256).toString('base64').substr(100, 5);
        let key_for_verify = key_one + key_two;

        try {
            const hash = await bcrypt.hash(user_pwd, 12);
            await User.create({
                user_id,
                user_pwd: hash,
                user_email, user_nickname, user_phone,
                key_for_verify, email_verified: 0,
            });

            let url = 'http://ontelier.co.kr/confirmEmail?key=' + key_for_verify;

            let emailParam = {
                toEmail: user_email,
                subject: '온뜰 - 이메일 인증',
                text: '이메일 인증을 위해 클릭해주세요\n' + url
            };

            mailer.sendGmail(emailParam);

            return res.send({ status: 'success', message: '가입완료!\n이메일을 확인해주세요!'});
        } catch (error) {
            console.error(error);
            return res.send({ status: 'error', message: '오류가 발생했습니다' });
        }
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