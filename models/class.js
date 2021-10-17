const Sequelize = require('sequelize');

module.exports = class Class extends Sequelize.Model {
	static init(sequelize) {
		return super.init({
			class_title: {
				type: Sequelize.STRING(50),
				allowNull: false,
			},
			category: {
				type: Sequelize.STRING(30),
				allowNull: false,
			},
			class_price: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			class_info: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			teacher_name: {
				type: Sequelize.STRING(15),
				allowNull: false,
			},
			teacher_info: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			class_img: {
				type: Sequelize.STRING(100),
				allowNull: true,
			},
		}, {
			sequelize,
			timestamps: true,
			underscored: false,
			modelName: 'Class',
			tableName: 'classes',
			paranoid: true,
			charset: 'utf8',
			collate: 'utf8_general_ci',
		});
	}
}
