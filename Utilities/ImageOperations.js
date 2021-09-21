const Image = require("../models/Image")
const { findOrCreateTags } = require("./TagOperations")
const Sequelize = require("sequelize")

/**
 * ----------------------------------------------------------------------------
 * @description Get the formatted data for bulk uploads
 * @param {*} globalName If image name not provided
 * @param {[String]} globalTags Tags applied to all Images
 * @param {[{name, link, tags, isPublic}]} uploads ALl Images
 * @param {String} userId
 * @param {String} username
 * @returns [err, [Image]]
 */
function generateBulkCreateData(
    globalName = "Image",
    globalTags = [],
    uploads,
    userId,
    username
) {
    const bulkImagesData = []
    return new Promise((resolve) => {
        for (let i = 0; i < uploads.length; i++) {
            const { name, link, tags = [], isPublic } = uploads[i]
            const allTags = Array.from(new Set([...globalTags, ...tags])).map(
                (tag) => tag.toLowerCase()
            )
            if (!link) return resolve(["Please Enter valid Images", null])
            bulkImagesData.push({
                name: name && name.trim().length ? name : globalName + "_" + (i + 1),
                link,
                tagsArray: allTags.join("|"),
                creatorId: userId,
                creatorUserName: username,
            })
            if (i === uploads.length - 1) return resolve([null, bulkImagesData])
        }
    })
}

/**
 * ----------------------------------------------------------------------------
 * @description Function for Bulk Upload images
 * @param {[{name, link, tags, isPublic}]} uploads All Images
 * @param {String} usersId Logged in user id
 * @returns
 */
function bulkImageUploads(uploads, userId) {
    return new Promise(async (resolve) => {
        try {
            const response = await Image.bulkCreate(uploads, {
                returning: true,
                plain: true,
            })
            if (!response) throw new Error("Images cant be created")

            const recentImages = await Image.findAll({
                where: { creatorId: userId },
                limit: uploads.length,
                order: [["createdAt", "DESC"]],
            })
            if (!recentImages) throw new Error("Images cant be created")

            const uploadedImages = []

            for (let i = 0; i < uploads.length; i++) {
                const image = recentImages[i].dataValues
                const { id, tagsArray } = image
                uploadedImages.push(image)

                const splittedTags = tagsArray.split("|")
                findOrCreateTags(id, splittedTags)
            }

            return resolve([null, uploadedImages])
        } catch (err) {
            console.error(err)
            return resolve([err, null])
        }
    })
}

/**
 * ----------------------------------------------------------------------------
 * @description Function that inserts Image
 * @param {*} name
 * @param {*} link
 * @param {Array} tagsArray
 * @param {*} creatorId
 * @param {*} creatorUserName
 * @param {String?} [prefixName] A prefixName for image
 */
async function insertImage(
    name,
    link,
    tagsArray,
    creatorId,
    creatorUserName,
    isPublic
) {
    if (tagsArray) tagsArray = tagsArray.map((tag) => tag.toLowerCase())
    return new Promise(async (resolve) => {
        try {
            const image = {
                name:
                    name && name.trim().length
                        ? name
                        : "Image_" + Math.random().toString(36).substr(2, 9),
                link,
                tagsArray: tagsArray.join("|"),
                creatorId,
                creatorUserName,
                isPublic,
            }
            console.log("insert image", image)
            const response = await Image.create(image, {
                returning: true,
                plain: true,
            })
            if (!response.dataValues) throw new Error("Images cant be created")

            const [err] = await findOrCreateTags(response.dataValues.id, tagsArray)
            if (err) throw err

            return resolve([null, response.dataValues])
        } catch (err) {
            console.error(err)
            return resolve([err, null])
        }
    })
}

/**
 * ----------------------------------------------------------------------------
 * @description Function returns the images with given id, userId or name. If none of them is provided, then it returns list of images.
 * This function also shows the images that are wither public or is uploaded by the user
 * @param {{id?, name?, userId?, loggedUser, page?, limit?, isSingle?}} arg related Arguments
 * @example
 * {*} [id] Optional Image Id
 * {*} [name] Optional Image Name
 * {*} [userId] Optional User Id
 * {*} loggedUser Logged in user's Id
 * {Number} [page] Pages to skip
 * {Number} [limit] Number of Images
 * {Boolean} [isSingle] get only 1 image with given id
 * @returns {[Error,Images]}
 */
async function getImages(arg = {}) {
    let { id, name, userId, page, limit, loggedUser, isSingle } = arg
    if (!page) page = 1
    if (!limit) limit = 10
    if (!isSingle) isSingle = false

    return new Promise(async (resolve) => {
        try {
            let where = {}
            if (id) where.id = id
            if (name) where.name = name
            if (userId) where.creatorId = userId

            const rawImage = await Image.findAll({
                where: Sequelize.and(
                    where,
                    !loggedUser
                        ? { isPublic: 1 }
                        : Sequelize.or({ creatorId: loggedUser }, { isPublic: 1 })
                ),
                offset: (page - 1) * parseInt(limit),
                limit: parseInt(limit),
                order: [["createdAt", "DESC"]],
            })

            const images = []
            rawImage.forEach(({ dataValues }) => images.push(dataValues))
            console.log("get Images", arg, images)

            if (images.length === 0 && isSingle)
                return resolve(["You are not authorized to access the image", null])

            return resolve([null, images])
        } catch (err) {
            console.error(err)
            return resolve([err, null])
        }
    })
}

/**
 * ----------------------------------------------------------------------------
 * @description Like or dislike an Image with give Id
 * @param id Image Id
 * @param like +1 for like and -1 for dislike
 */
async function reactOnImage(id, like) {
    const num = parseInt(like) > 0 ? 1 : -1
    return Image.increment({ likes: num }, { where: { id } })
}

module.exports = {
    insertImage,
    getImages,
    generateBulkCreateData,
    bulkImageUploads,
    reactOnImage,
}
