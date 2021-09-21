const TagMapping = require("../models/TagMapping")
const Image = require("../models/Image")

/**
 * ----------------------------------------------------------------------------
 * @description Function returns the images with the given tags
 * @param {{tags, page?, limit?}} tags tags
 * @example
 * {[String]} tags : Array of Tags
 * {Number} [page]
 * {Number} [limit]
 * @returns {[Error,Images]}
 */
async function getTagImages(arg) {
    let { tags, page, limit } = arg
    if (!page) page = 1
    if (!limit) limit = 10

    let where = {}
    if (tags) where = { tagName: tags.map((tag) => tag.toLowerCase()) }
    return new Promise(async (resolve) => {
        try {
            const rawImage = await TagMapping.findAll({
                where,
                offset: (page - 1) * parseInt(limit),
                limit: parseInt(limit),
                attributes: ["imageId"],
                include: [
                    {
                        model: Image,
                        required: true,
                    },
                ],
            })

            const images = new Set()
            rawImage.forEach(({ dataValues }) => images.add(dataValues.image))
            console.log("get Images By Tag", arg, images)
            return resolve([null, Array.from(images)])
        } catch (err) {
            console.error(err)
            return resolve([err, null])
        }
    })
}

/**
 * ----------------------------------------------------------------------------
 * @description Add Mapping of Image with the Tagname
 * @param {*} imageId
 * @param {*} tagName
 * @returns
 */
async function addImageTagMapping(imageId, tagName) {
    return new Promise(async (res) => {
        try {
            const { dataValues } = await TagMapping.create({ imageId, tagName })
            if (dataValues) return res([null, dataValues])
            throw new Error("Mapping cant be created")
        } catch (err) {
            return res([err, null])
        }
    })
}

module.exports = { getTagImages, addImageTagMapping }
