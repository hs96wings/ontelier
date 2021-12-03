const Sequelize = require('sequelize');
const moment = require('moment');

module.exports = class Lecture_info extends Sequelize.Model {
	static init(sequelize) {
		return super.init({
            lecture_goal: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            lecture_summary: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            lecture_previous: {
                type: Sequelize.TEXT,
                allowNull: true
            },
		}, {
			sequelize,
			timestamps: true,
			underscored: false,
			modelName: 'Lecture_info',
			tableName: 'lecture_infos',
			paranoid: true,
			charset: 'utf8',
			collate: 'utf8_general_ci',
		})
	}

	static associate(db) {
		db.Lecture_info.belongsTo(db.Cirriculum);
	};
}
