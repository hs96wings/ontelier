const Sequelize = require('sequelize');

module.exports = class Review extends Sequelize.Model {
	static init(sequelize) {
		return super.init({
			review_score: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 0,
			},
			review_enrolldate: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW(),
				get() {
                    const d = this.getDataValue('user_enrolldate');
                    return moment(d).format("YYYY/MM/DD H:mm:ss");
                }
			},
			review_img: {
				type: Sequelize.STRING(100),
				allowNull: true,
			},
			review_best_num: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 0,
			},
		}, {
			sequelize,
			timestamps: true,
			underscored: false,
			modelName: 'Review',
			tableName: 'reviews',
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
