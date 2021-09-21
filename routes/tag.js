const router = require("express").Router()
const { getAllTags } = require("../Utilities/TagOperations")

/**
 * ----------------------------------------------------------------------------
 * @description Get all the tags
 */
router.get("/all", async (req, res) => {
    const { page, limit } = req.params
    let [err, tags] = await getImages({ page, limit })
    if (err) return res.send({ status: 400, msg: err })
    return res.send({ status: 200, data: tags })
})

module.exports = router
