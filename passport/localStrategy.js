const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'user_id',
        passwordField: 'user_pwd',
    }, async (user_id, user_pwd, done) => {
        try {
            const exUser = await User.findOne({ where: { user_id }});
            if (exUser) {
                if (exUser.email_verified === false) {
                    done(null, false, { message: '이메일 인증이 아직 완료되지 않았습니다'});
                } else {
                    const result = await bcrypt.compare(user_pwd, exUser.user_pwd);
                    // 인증 성공
                    if (result) {
                        done(null, exUser);
                    // user_id는 맞지만 비밀번호가 다름
                    } else {
                        done(null, false, { message: '비밀번호가 일치하지 않습니다' });
                    }
                }
            // user_id가 DB에 없을 때
            } else {
                done(null, false, { message: '가입되지 않은 회원입니다.'});
            }
        // DB 연결 실패
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};