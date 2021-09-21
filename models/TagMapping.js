const { Sequelize } = require("sequelize")
const Image = require("./Image")
const Tag = require("./Tag")

const TagMapping = sqlDb.define(
    "tagMapping",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        imageId: {
            type: Sequelize.INTEGER,
            notNull: true,
            references: {
                model: "image",
                key: "id",
            },
        },
        tagName: {
            type: Sequelize.STRING(40),
            notNull: true,
            references: {
                model: "tag",
                key: "name",
            },
        },
    },
    {
        timestamps: false,
    }
)

TagMapping.belongsTo(Image, { foreignKey: "imageId" })
TagMapping.belongsTo(Tag, { foreignKey: "tagName" })

module.exports = TagMapping
