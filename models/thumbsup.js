const Sequelize = require('sequelize');
const moment = require('moment');

module.exports = class Thumbsup extends Sequelize.Model {
	static init(sequelize) {
		return super.init({
            thumbsup_enrolldate: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW(),
                get() {
                    const d = this.getDataValue('thumbsup_enrolldate');
                    return moment(d).format("YYYY/MM/DD H:mm:ss");
                }
            },
		}, {
			sequelize,
			timestamps: true,
			underscored: false,
			modelName: 'Thumbsup',
			tableName: 'thumbsups',
			paranoid: true,
			charset: 'utf8',
			collate: 'utf8_general_ci',
		})
	}

	static associate(db) {
		db.Thumbsup.belongsTo(db.User);
		db.Thumbsup.belongsTo(db.Review);
	};
}
