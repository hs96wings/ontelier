const Sequelize = require('sequelize');
const moment = require('moment');

module.exports = class Lecture_cmt extends Sequelize.Model {
	static init(sequelize) {
		return super.init({
			lecture_cmt_enrolldate: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW(),
				get() {
                    const d = this.getDataValue('lecture_cmt_enrolldate');
                    return moment(d).format("YYYY/MM/DD H:mm:ss");
                }
			},
			lecture_cmt_text: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
		}, {
			sequelize,
			timestamps: true,
			underscored: false,
			modelName: 'Lecture_cmt',
			tableName: 'lecture_cmts',
			paranoid: true,
			charset: 'utf8',
			collate: 'utf8_general_ci',
		})
	}

	static associate(db) {
		db.Lecture_cmt.belongsTo(db.User);
		db.Lecture_cmt.belongsTo(db.Class);
	};
}
