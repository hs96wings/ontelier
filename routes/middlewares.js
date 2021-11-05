exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("error", "로그인이 필요합니다");
        res.redirect('/login');
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        req.flash('error', '로그인한 상태입니다');
        res.redirect('/');
    }
}

exports.isAdmin = (req, res, next) => {
    if (req.user.user_roll !== 'user') {
        next();
    } else {
        req.flash('error', '권한이 없습니다');
        res.redirect('/');
    }
}

exports.isSuper = (req, res, next) => {
    if (req.user.user_roll === 'admin') {
        next();
    } else {
        req.flash('error', '권한이 없습니다');
        res.redirect('/');
    }
}