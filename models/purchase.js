const Sequelize = require('sequelize');

module.exports = class Purchase extends Sequelize.Model {
	static init(sequelize) {
		return super.init({
            purchase_enrolldate: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW(),
                get() {
                    const d = this.getDataValue('user_enrolldate');
                    return moment(d).format("YYYY/MM/DD H:mm:ss");
                }
            },
		}, {
			sequelize,
			timestamps: true,
			underscored: false,
			modelName: 'Purchase',
			tableName: 'purchases',
			paranoid: true,
			charset: 'utf8',
			collate: 'utf8_general_ci',
		})
	}

	static associate(db) {
		db.Purchase.belongsTo(db.User);
		db.Purchase.belongsTo(db.Class);
	};
}
