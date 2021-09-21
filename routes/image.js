const router = require("express").Router()
const { isAuthenticated } = require("../middlewares/authenticate")
const { checkInCache } = require("../middlewares/cacheCheck")
const {
    getImages,
    insertImage,
    generateBulkCreateData,
    bulkImageUploads,
    reactOnImage,
} = require("../Utilities/ImageOperations")
const { incrementUserByUserId } = require("../Utilities/UserOperations")
const { getTagImages } = require("../Utilities/ImageTagMappingOperations")
const { getTagDetails } = require("../Utilities/TagOperations")
const { setImagesInRedis } = require("../Utilities/redisOperations")

/**
 * ----------------------------------------------------------------------------
 * @description Create an Image
 */
router.post("/create", isAuthenticated, async (req, res) => {
    const { name, link, tags, isPublic } = req.body

    if (!link || link.trim().length === 0 || !tags || tags.length === 0)
        return res.send({
            status: 400,
            msg: "Please Enter all the required fields properly.",
        })

    console.log("req user", req.user)
    const [err, data] = await insertImage(
        name,
        link,
        tags,
        req.user.id,
        req.user.username,
        isPublic
    )
    incrementUserByUserId(req.user.id)
    if (err)
        return res.send({
            status: 400,
            msg: err,
        })

    res.send({ status: 200, msg: "Image created successfully!", data })
})

/**
 * ----------------------------------------------------------------------------
 * @description Create bulk Image
 */
router.post("/create/bulk", isAuthenticated, async (req, res) => {
    const { globalTags = [], globalName, uploads = [] } = req.body
    const [dataErr, bulkImagesData] = await generateBulkCreateData(
        globalName,
        globalTags,
        uploads,
        req.user.id,
        req.user.username
    )

    if (dataErr)
        return res.send({
            status: 400,
            msg: dataErr,
        })

    console.log("formatted bulk data", bulkImagesData)
    const [err, data] = await bulkImageUploads(bulkImagesData, req.user.id)
    if (err)
        return res.send({
            status: 400,
            msg: err,
        })
    console.log("data from uploaded images ", data)

    incrementUserByUserId(req.user.id, uploads.length)

    res.send({ status: 200, msg: "Images created successfully!", data })
})

/**
 * ----------------------------------------------------------------------------
 * @description Get all Images with given tagName
 */
router.get("/", checkInCache, async (req, res) => {
    let { limit, page, tags, details } = req.query
    let args = { limit, page, loggedUser: req.user?.id }

    if (tags) args = { ...args, tags: tags.split(",") }

    let data
    let err, images
    if (tags) [err, images] = await getTagImages(args)
    else [err, images] = await getImages({ limit, page, loggedUser: req.user?.id })
    data = images

    if (tags && details === "true") {
        let splittedTags = tags.split(",")
        let [tagErr, tagDetails] = await getTagDetails(splittedTags)
        if (tagErr) return res.send({ status: 400, msg: tagErr })
        data = { images, tags: tagDetails }
    }

    if (err) return res.send({ status: 400, msg: err })

    setImagesInRedis(req.originalUrl, data)
    return res.send({ status: 200, data })
})

/**
 * ----------------------------------------------------------------------------
 * @description Get all images
 */
router.get("/all", checkInCache, async (req, res) => {
    const { limit, page } = req.query

    let [err, images] = await getImages({ limit, page, loggedUser: req.user?.id })
    if (err) return res.send({ status: 400, msg: err })
    setImagesInRedis(req.originalUrl, images)
    return res.send({ status: 200, data: images })
})

/**
 * ----------------------------------------------------------------------------
 * @description Get all images for given user
 */
router.get("/all/:userId", checkInCache, async (req, res) => {
    const { limit, page } = req.query
    const { userId } = req.params
    let [err, images] = await getImages({
        userId,
        limit,
        page,
        loggedUser: req.user?.id,
    })
    if (err) return res.send({ status: 400, msg: err })
    setImagesInRedis(req.originalUrl, images)
    return res.send({ status: 200, data: images })
})

/**
 * ----------------------------------------------------------------------------
 * @description Get an Image with given Id or name array
 */
router.get("/multi", checkInCache, async (req, res) => {
    let { limit, page, id, name } = req.query
    if (id) id = id.split(",")
    let [err, images] = await getImages({
        id,
        limit,
        page,
        name,
        loggedUser: req.user?.id,
    })
    if (err) return res.send({ status: 400, msg: err })
    setImagesInRedis(req.originalUrl, images)
    return res.send({ status: 200, data: images })
})

/**
 * ----------------------------------------------------------------------------
 * @description Get an Image with given Id and properly secured
 */
router.get("/single", checkInCache, async (req, res) => {
    let { limit, page, id, name } = req.query
    if (!id) return res.send({ status: 400, msg: "Please send a valid Image Id" })
    let [err, images] = await getImages({
        id,
        limit,
        page,
        name,
        loggedUser: req.user?.id,
        isSingle: true,
    })
    if (err) return res.send({ status: 400, msg: err })
    return res.send(`<img src="${images[0].link}" alt="${images[0].name}" />`)
})

/**
 * ----------------------------------------------------------------------------
 * @description Like or dislike an Image
 */
router.patch("/react", isAuthenticated, async (req, res) => {
    let { id, like } = req.body
    if (!id) return res.send({ status: 400, msg: "Please send a valid Image Id" })
    if (!like || !(Number.isInteger(like) || Number.isInteger(parseInt(like))))
        return res.send({ status: 400, msg: "Please valid react on the Image" })

    try {
        await reactOnImage(id, like)
        return res.send({ status: 200, msg: "Image reaction successful!" })
    } catch (err) {
        if (err) return res.send({ status: 400, msg: err })
    }
})

module.exports = router
