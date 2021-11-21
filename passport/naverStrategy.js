const passport = require('passport');
const NaverStrategy = require('passport-naver').Strategy;

const User = require('../models/user');

module.exports = () => {
    passport.use(new NaverStrategy({
        clientID: process.env.NAVER_ID,
        clientSecret: process.env.NAVER_SECRET,
        callbackURL: '/auth/naver/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        console.log('naver profile', profile);
        try {
            const exUser = await User.findOne({
                where: { user_id: profile.id, provider: 'naver' },
            });
            if (exUser) {
                done(null, exUser);
            } else {
                let user_email;
                let user_nickname;
                if (profile._json && profile._json.email === undefined) {
                    user_email = null;
                } else {
                    user_email = profile._json && profile._json.email;
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
                    provider: 'naver',
                });
                done(null, newUser);
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};