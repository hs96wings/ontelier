const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const naver = require('./naverStrategy');
const User = require('../models/user');

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user.user_id);
    });

    passport.deserializeUser((user_id, done) => {
        User.findOne({ where: { user_id }})
        .then(user => done(null, user))
        .catch(err => done(err));
    });

    local();
    kakao();
    naver();
};