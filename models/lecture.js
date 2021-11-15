const Sequelize = require('sequelize');

module.exports = class Lecture extends Sequelize.Model {
	static init(sequelize) {
		return super.init({
            video_url: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            video_info: {
                type: Sequelize.TEXT,
                allowNull: true,
            }
		}, {
			sequelize,
			timestamps: true,
			underscored: false,
			modelName: 'Lecture',
			tableName: 'lectures',
			paranoid: true,
			charset: 'utf8',
			collate: 'utf8_general_ci',
		})
	}

	static associate(db) {
        db.Lecture.belongsTo(db.Class);
	};
}
