function isAuthenticated(req, res, next) {
    if (req.user) {
        next()
    } else {
        res.status(200).send({ status: 401, msg: "User not Authenticated!" })
    }
}

module.exports = { isAuthenticated }
