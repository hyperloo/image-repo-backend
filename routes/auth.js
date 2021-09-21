const router = require("express").Router()
const passport = require("passport")
const { isAuthenticated } = require("../middlewares/authenticate")

/**
 * ----------------------------------------------------------------------------
 * @description Login to the App
 */
router.get(
    "/login",
    passport.authenticate("google", { scope: ["profile", "email"] })
)

/**
 * ----------------------------------------------------------------------------
 * @description Callback by google
 */
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/api/auth/failure" }),
    function (req, res) {
        if (!req.user) res.redirect("/api/auth/failure")
        else res.redirect("/api/auth/success")
    }
)

/**
 * ----------------------------------------------------------------------------
 * @description Redirect to frontend on login success.
 */
router.get("/success", isAuthenticated, (req, res) => {
    console.log(req.user)
    res.redirect("http://localhost:3000")
})

/**
 * ----------------------------------------------------------------------------
 * @description Show failed login
 */
router.get("/failure", (req, res) => {
    if (req.user) return res.redirect("/api/auth/success")
    res.send({
        status: 400,
        msg: `Authorization Error! Cannot Login.`,
    })
})

/**
 * ----------------------------------------------------------------------------
 * @description logout route
 */
router.get("/logout", (req, res) => {
    req.user = null
    req.logout()
    res.send({ status: 200, msg: "Logout Successful!" })
})

module.exports = router
