const router = require("express").Router()
const { isAuthenticated } = require("../middlewares/authenticate")
const { putPresignedUrl, getPresignedUrl } = require("../Utilities/awsOperations")

/**
 * ----------------------------------------------------------------------------
 * @description Route for put Signed Urls
 */
router.get("/put-signed-url", isAuthenticated, async (req, res) => {
    const { uploads } = req.query
    const [err, signedPosts] = await putPresignedUrl(uploads ?? 1)

    if (err) return res.send({ status: 400, msg: err })
    return res.send({ status: 200, data: signedPosts })
})

/**
 * ----------------------------------------------------------------------------
 * @description Route to get Signed Urls
 */
router.get("/get-signed-url", isAuthenticated, async (req, res) => {
    let { key } = req.query
    if (!key || key.trim().length === 0)
        return res.send({ status: 400, msg: "Please Enter valid Key to get" })

    key = key.split(",")

    const [err, signedUrls] = await getPresignedUrl(key)
    if (err) return res.send({ status: 400, msg: err })
    return res.send({ status: 200, data: signedUrls })
})

module.exports = router
