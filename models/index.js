const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const Class = require('./class');
const Conn = require('./conn');

const db = {};
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.Class = Class;
db.Conn = Conn;

Class.init(sequelize);
Conn.init(sequelize);

module.exports = db;