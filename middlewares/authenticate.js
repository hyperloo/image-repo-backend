function isAuthenticated(req, res, next) {
    if (req.user) {
        next()
    } else {
        res.status(200).send({ status: 401, msg: "User not Authenticated!" })
    }
}
function isAuthenticatedWithNoUsername(req, res, next) {
    if (!req.user) {
        res.status(200).send({ status: 401, msg: "User not Authenticated!" })
    } else if (req.user.username) {
        res.status(200).send({
            status: 401,
            msg: "You already have a username " + req.user.username + "!",
        })
    }
    next()
}

module.exports = { isAuthenticated, isAuthenticatedWithNoUsername }
