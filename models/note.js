const Sequelize = require('sequelize');
const moment = require('moment');

module.exports = class Note extends Sequelize.Model {
	static init(sequelize) {
		return super.init({
			note_text: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            note_video: {
                type: Sequelize.STRING(100),
                allowNull: true,
            }
		}, {
			sequelize,
			timestamps: true,
			underscored: false,
			modelName: 'Note',
			tableName: 'notes',
			paranoid: true,
			charset: 'utf8',
			collate: 'utf8_general_ci',
		})
	}

	static associate(db) {
		db.Note.belongsTo(db.Class);
	};
}
