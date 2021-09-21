const { Sequelize } = require("sequelize")
const User = require("./User")

const Image = sqlDb.define(
    "image",
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING(100),
        },
        link: {
            type: Sequelize.STRING(20000),
            notNull: true,
            validate: {
                isUrl: true,
            },
        },
        tagsArray: {
            type: Sequelize.STRING(1000),
        },
        creatorId: {
            type: Sequelize.STRING(40),
            references: {
                model: "user",
                key: "id",
            },
        },
        creatorUserName: {
            type: Sequelize.STRING(40),
        },
        isPublic: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
        downloads: {
            type: Sequelize.INTEGER,
            default: 0,
        },
        likes: {
            type: Sequelize.INTEGER,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)

Image.belongsTo(User, { foreignKey: "creatorId" })

module.exports = Image
