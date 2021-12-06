const Sequelize = require('sequelize');
const moment = require('moment');

module.exports = class Class extends Sequelize.Model {
	static init(sequelize) {
		return super.init({
			// 강의 제목
			class_title: {
				type: Sequelize.STRING(50),
				allowNull: false,
			},
			// 강의 가격
			class_price: {
				type: Sequelize.INTEGER,	
				allowNull: false,
			},
			// 강의 평가
			class_score: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 0,
			},
			// 강의 이미지
			class_img: {
				type: Sequelize.STRING(100),
				allowNull: true,
			},
			// 강의 등록날짜
			class_enrolldate: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW(),
                get() {
                    const d = this.getDataValue('class_enrolldate');
                    return moment(d).format("YYYY/MM/DD H:mm:ss");
                }
            },
			// 가족동반
			class_family: {
				type: Sequelize.TINYINT,
				allowNull: true,
				defaultValue: 0,
			},
			// 카테고리
			category_high: {
				type: Sequelize.STRING(40),
				allowNull: false,
			},
			category_low: {
				type: Sequelize.STRING(40),
				allowNull: false,
			},
			// 클래스 소개
			class_info: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			// 강사 이름
			teacher_name: {
				type: Sequelize.STRING(15),
				allowNull: true,
			},
			// 강사 소개
			teacher_info: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			// 할인률
			class_discount: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 0,
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

	static associate(db) {
		db.Class.hasMany(db.Review);
		db.Class.hasMany(db.Wishlist);
		db.Class.hasMany(db.Purchase);
		db.Class.hasMany(db.Lecture_cmt);
		db.Class.hasOne(db.Cirriculum);
		db.Class.belongsTo(db.User);
	}
}
