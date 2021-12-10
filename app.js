const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');
const favicon = require('serve-favicon');
const flash = require('connect-flash');
const axios = require('axios');

dotenv.config();
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');
const categoryRouter = require('./routes/category');
const userRouter = require('./routes/user');
const classRouter = require('./routes/class');
const { sequelize } = require('./models');
const passportConfig = require('./passport');
const multer = require('multer');

const app = express();
app.use(favicon(path.join(__dirname, 'public/', 'favicon.ico')));
passportConfig();
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'html');
nunjucks.configure('views', {
	express: app,
	watch: true,
});
sequelize.sync({ force: false })
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((err) => {
        console.error(err);
    });

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: process.env.COOKIE_SECRET,
	cookie: {
		httpOnly: true,
		secure: false,
	},
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/auth', authRouter);
app.use('/category', categoryRouter);
app.use('/mypage', userRouter);
app.use('/class', classRouter);

app.use((err, req, res, next) => {
	if (err instanceof multer.MulterError) {
		// return res.status(418).send(err.code);
		return res.send('<script type="text/javascript">alert("파일 용량 제한: 10MB"); history.go(-1); </script>');
	}
	res.status = 404;
	res.send('<script type="text/javascript">alert("잘못된 페이지입니다"); window.location = "/"; </script>');
});

app.use((err, req, res) => {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	res.status(err.status || 500);
	res.send('<script type="text/javascript">alert("서버가 응답하지 않습니다"); window.location = "/"; </script>');
});


app.listen(app.get('port'), function() {
	console.log('Example app listening on port 3000!');
});
