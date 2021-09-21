const User = require("../models/User")
const Tag = require("../models/Tag")
const { addImageTagMapping } = require("./ImageTagMappingOperations")

/**
 * ----------------------------------------------------------------------------
 * @description Get all Distinct Tags
 * @param {{limit?, page?}} args
 * @example
 * {Number} [limit]
 * {Number} [page]
 * @returns {[err, [Tags]]}
 */
async function getAllTags({ limit, page }) {
    if (!page) page = 1
    if (!limit) limit = 10
    return new Promise(async (resolve) => {
        try {
            const rawTags = await Tag.findAll({
                order: [["numberOfImages", "DESC"]],
                offset: (page - 1) * parseInt(limit),
                limit: parseInt(limit),
            })
            const tags = []
            rawTags.forEach(({ dataValues }) => tags.push(dataValues))
            console.log("all tags", tags)
            return resolve([null, tags])
        } catch (err) {
            console.error(err)
            return resolve([err, null])
        }
    })
}

/**
 * ----------------------------------------------------------------------------
 * @description Increment imageNumber count of old or create a new Tag
 * @param {*} imageId
 * @param {String} tags
 */
async function findOrCreateTags(imageId, tags) {
    return new Promise(async (resolve) => {
        try {
            let tagsIdArray = []
            for (let i = 0; i < tags.length; i++) {
                const [tag, isCreated] = await Tag.findOrCreate({
                    where: { name: tags[i] },
                    default: { name: tags[i] },
                })

                if (!isCreated) tagsIdArray.push(tag.dataValues.id)

                console.log("find or create tags ", imageId, tag.dataValues.name)
                const [err] = await addImageTagMapping(imageId, tag.dataValues.name)
                if (err) throw err

                if (i === tags.length - 1) {
                    incrementTagByTagId(tagsIdArray)
                    return resolve([null, null])
                }
            }
        } catch (err) {
            console.error(err)
            return resolve([err, null])
        }
    })
}

/**
 * ----------------------------------------------------------------------------
 * @description Increase the image count of tags
 * @param {Array|String} id Array of ids or single Id
 */
function incrementTagByTagId(id) {
    if (!Array.isArray(id)) id = [id]
    return Tag.increment({ numberOfImages: +1 }, { where: { id } })
}

/**
 * ----------------------------------------------------------------------------
 * @description Get Tag Details by tag names
 * @param {[String]} tagNames
 */

async function getTagDetails(tagNames) {
    if (tagNames && !Array.isArray(tagNames)) tagNames = tagNames.split(",")
    return new Promise(async (resolve) => {
        try {
            const rawTags = await Tag.findAll({
                where: { name: tagNames },
            })

            const tags = []
            rawTags.forEach(({ dataValues }) => tags.push(dataValues))
            console.log("tag details", tags)
            return resolve([null, tags])
        } catch (err) {
            console.error(err)
            return resolve([err, null])
        }

        c
    })
}

module.exports = { findOrCreateTags, incrementTagByTagId, getAllTags, getTagDetails }
