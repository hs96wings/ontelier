const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

const Class = require('./class');
const User = require('./user');
const Review = require('./review');
const Wishlist = require('./wishlist');
const Purchase = require('./purchase');
const Thumbsup = require('./thumbsup');

const Cirriculum = require('./cirriculum');
const Lecture_info = require('./lecture_info');
const Lecture_cmt = require('./lecture_cmt');

const db = {};
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.Class = Class;
db.User = User;
db.Review = Review;
db.Wishlist = Wishlist;
db.Purchase = Purchase;
db.Thumbsup = Thumbsup;
db.Cirriculum = Cirriculum;
db.Lecture_info = Lecture_info;
db.Lecture_cmt = Lecture_cmt;

Class.init(sequelize);
User.init(sequelize);
Review.init(sequelize);
Wishlist.init(sequelize);
Purchase.init(sequelize);
Thumbsup.init(sequelize);
Cirriculum.init(sequelize);
Lecture_info.init(sequelize);
Lecture_cmt.init(sequelize);

Class.associate(db);
User.associate(db);
Review.associate(db);
Wishlist.associate(db);
Purchase.associate(db);
Thumbsup.associate(db);
Cirriculum.associate(db);
Lecture_info.associate(db);
Lecture_cmt.associate(db);

module.exports = db;