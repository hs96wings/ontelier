const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const Class = require('./class');
const User = require('./user');
const Review = require('./review');
const Wishlist = require('./wishlist');
const Purchase = require('./purchase');
const Lecture = require('./lecture');

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
db.Lecture = Lecture;

Class.init(sequelize);
User.init(sequelize);
Review.init(sequelize);
Wishlist.init(sequelize);
Purchase.init(sequelize);
Lecture.init(sequelize);

Class.associate(db);
User.associate(db);
Review.associate(db);
Wishlist.associate(db);
Purchase.associate(db);
Lecture.associate(db);

module.exports = db;