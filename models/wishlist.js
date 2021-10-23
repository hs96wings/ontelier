const Sequelize = require('sequelize');

module.exports = class Wishlist extends Sequelize.Model {
	static init(sequelize) {
		return super.init({
            wishlist_enrolldate: {
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
			modelName: 'Wishlist',
			tableName: 'wishlists',
			paranoid: true,
			charset: 'utf8',
			collate: 'utf8_general_ci',
		})
	}

	static associate(db) {
		db.Review.belongsTo(db.User);
		db.Review.belongsTo(db.Class);
	};
}
