const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            user_id: {
                type: Sequelize.STRING(50),
                allowNull: false,
                primaryKey: true,
            },
            user_pwd: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            user_email: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            user_nickname: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },
            user_phone: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            user_enrolldate: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW(),
            },
            user_profile_url: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            user_roll: {
                type: Sequelize.STRING(10),
                allowNull: false,
                defaultValue: 'user',
            },
            provider: {
                type: Sequelize.STRING(10),
                allowNull: false,
                defaultValue: 'local',
            },
            snsId: {
                type: Sequelize.STRING(30),
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
};