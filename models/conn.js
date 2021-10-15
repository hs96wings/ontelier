const Sequelize = require('sequelize');

module.exports = class Conn extends Sequelize.Model {
	static init(sequelize) {
		return super.init({
			conn_ip: {
				type: Sequelize.STRING(100),
				allowNull: true,
			}
		}, {
			sequelize,
			timestamps: true,
			underscored: false,
			modelName: 'Conn',
			tableName: 'conns',
			paranoid: true,
			charset: 'utf8',
			collate: 'utf8_general_ci',
		});
	}
}
