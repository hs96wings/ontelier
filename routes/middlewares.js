exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        // res.status(403).send('로그인 필요');
        const message = encodeURIComponent('로그인이 필요합니다');
        res.redirect(`/?error=${message}`);
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        const message = encodeURIComponent('로그인한 상태입니다.');
        res.redirect(`/?error=${message}`);
    }
}

exports.isAdmin = (req, res, next) => {
    if (req.user.user_roll !== 'user') {
        next();
    } else {
        const message = encodeURIComponent('권한이 없습니다.');
        res.redirect(`/?error=${message}`);
    }
}

exports.isSuper = (req, res, next) => {
    if (req.user.user_roll === 'admin') {
        next();
    } else {
        const message = encodeURIComponent('권한이 없습니다.');
        res.redirect(`/?error=${message}`);
    }
}