const Sequelize = require('sequelize');
const moment = require('moment');

module.exports = class Cirriculum extends Sequelize.Model {
	static init(sequelize) {
		return super.init({
            depth: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            cirriculum_text: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            video_url: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
		}, {
			sequelize,
			timestamps: true,
			underscored: false,
			modelName: 'Cirriculum',
			tableName: 'cirriculums',
			paranoid: true,
			charset: 'utf8',
			collate: 'utf8_general_ci',
		})
	}

	static associate(db) {
		db.Cirriculum.belongsTo(db.Class);
	};
}
