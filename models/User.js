const { Sequelize } = require("sequelize")

const User = sqlDb.define(
    "user",
    {
        id: {
            type: Sequelize.STRING(40),
            primaryKey: true,
        },
        username: {
            type: Sequelize.STRING(20),
            validate: {
                isLowercase: true,
            },
        },
        name: {
            type: Sequelize.STRING(40),
            notNull: true,
        },
        picture: {
            type: Sequelize.STRING(20000),
            validate: {
                isUrl: true,
            },
        },
        email: {
            type: Sequelize.STRING(40),
            validate: {
                isEmail: true,
            },
        },
        language: {
            type: Sequelize.STRING(10),
            defaultValue: "en",
        },
        uploads: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        downloads: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = User
