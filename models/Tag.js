const { Sequelize } = require("sequelize")

const Tag = sqlDb.define(
    "tag",
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING(40),
            notNull: true,
        },
        numberOfImages: {
            type: Sequelize.INTEGER,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = Tag
