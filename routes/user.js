const router = require("express").Router()
const {
    isAuthenticated,
    isAuthenticatedWithNoUsername,
} = require("../middlewares/authenticate")
const { updateUserName } = require("../Utilities/UserOperations")
const { checkUserInRedis } = require("../Utilities/redisOperations")

/**
 * ----------------------------------------------------------------------------
 * @description Get the logged user
 */
router.get("/", isAuthenticated, (req, res) => {
    res.status(200).send({ status: 200, data: req.user })
})

/**
 * ----------------------------------------------------------------------------
 * @description Check if username exists
 */
router.get("/check", isAuthenticatedWithNoUsername, async (req, res) => {
    const { username } = req.query
    const [err, data] = await checkUserInRedis(username)
    if (err) return res.send({ status: 409, msg: err })
    res.send({ status: 200, msg: "Valid Username!", data: data })
})

/**
 * ----------------------------------------------------------------------------
 * @description Update User's Username
 */
router.patch("/", isAuthenticated, async (req, res) => {
    const { username } = req.query

    if (!username || username.trim().length === 0)
        return res.send({ status: 400, msg: "Please Enter a Valid Username" })

    const [redisErr] = await checkUserInRedis(username)
    if (redisErr) return res.send({ status: 409, msg: redisErr })

    try {
        const [err, data] = await updateUserName(req.user.id, username)

        if (err) throw err
        else {
            let user = data
            if (!user) user = { ...req.user, username }
            req.session.user = user
            req.session.passport.user = user

            redisClient.set(username, true)

            res.send({
                status: 200,
                msg: "Username Updation successful!",
                data: user,
            })
        }
    } catch (err) {
        console.error(err)
        res.send({
            status: 400,
            msg: "Username cannot be updated due to " + JSON.stringify(err),
        })
    }
})

module.exports = router
