const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const Class = require('./class');
const Conn = require('./conn');
const User = require('./user');
const Review = require('./review');

const db = {};
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.Class = Class;
db.Conn = Conn;
db.User = User;
db.Review = Review;

Class.init(sequelize);
Conn.init(sequelize);
User.init(sequelize);
Review.init(sequelize);

Class.associate(db);
User.associate(db);
Review.associate(db);

module.exports = db;