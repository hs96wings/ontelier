const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;

const User = require('../models/user');

module.exports = () => {
    passport.use(new KakaoStrategy({
        clientID: process.env.KAKAO_ID,
        callbackURL: '/auth/kakao/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        console.log('kakao profile', profile);
        try {
            const exUser = await User.findOne({
                where: { user_id: profile.id, provider: 'kakao' },
            });
            if (exUser) {
                done(null, exUser);
            } else {
                let user_email;
                let user_nickname;
                if (profile._json && profile._json.kakao_account.email === undefined) {
                    user_email = null;
                } else {
                    user_email = profile._json && profile._json.kakao_account.email;
                }
                if (profile.displayName === undefined) {
                    user_nickname = null;
                } else {
                    user_nickname = profile.displayName;
                }

                const newUser = await User.create({
                    user_id: profile.id,
                    user_nickname: user_nickname,
                    user_email: user_email,
                    provider: 'kakao',
                });
                done(null, newUser);
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};