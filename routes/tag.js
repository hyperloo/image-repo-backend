const router = require("express").Router()
const { getAllTags, getTagDetails } = require("../Utilities/TagOperations")

/**
 * ----------------------------------------------------------------------------
 * @description Get all the tags
 */
router.get("/all", async (req, res) => {
    const { page, limit } = req.query
    let [err, tags] = await getAllTags({ page, limit })
    if (err) return res.send({ status: 400, msg: err })
    return res.send({ status: 200, data: tags })
})

/**
 * ----------------------------------------------------------------------------
 * @description Get tags details with given name
 */
router.get("/", async (req, res) => {
    const { name } = req.query

    let err, tags
    if (name) [err, tags] = await getTagDetails(name)
    else [err, tags] = await getAllTags({})
    if (err) return res.send({ status: 400, msg: err })
    return res.send({ status: 200, data: tags })
})

module.exports = router
