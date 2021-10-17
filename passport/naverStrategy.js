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
                where: { snsId: profile.id, provider: 'naver' },
            });
            if (exUser) {
                done(null, exUser);
            } else {
                const newUser = await User.create({
                    user_id: profile._json && profile._json.email,
                    user_nickname: profile.displayName,
                    user_email: profile._json && profile._json.email,
                    snsId: profile.id,
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