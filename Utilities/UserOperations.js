const User = require("../models/User")

/**
 * ----------------------------------------------------------------------------
 * @description Function that check user if exists or creates user
 * @param {*} id
 * @param {Object} profile
 * @returns {[Error,User]} The user and if the user is newly created
 */
async function checkIfExistsOrCreate(id, profile) {
    const { name, email, locale, picture } = profile._json
    try {
        const [user, isCreated] = await User.findOrCreate({
            where: { id },
            defaults: {
                id: id,
                username: null,
                name,
                email,
                language: locale,
                picture,
            },
        })

        return [null, user.dataValues, isCreated]
    } catch (err) {
        console.error(err)
        return [err.errors[0].message, null]
    }
}

/**
 * ----------------------------------------------------------------------------
 * @description Function returns the users with given id or username. If none of them is provided, then it returns list of users
 * @param {*} [id] Optional User Id
 * @param {*} [username] Optional User Name
 * @returns {[Error, [Users]]}
 */
async function getUsers(id, username) {
    const where = {}
    if (id) where.id = id
    if (username) where.username = username
    try {
        const response = await User.findAll({
            where,
        })

        const users = []
        response.forEach(({ dataValues }) => users.push(dataValues))
        return [null, users]
    } catch (err) {
        console.error(err)
        return [err.errors[0].message, null]
    }
}

/**
 * ----------------------------------------------------------------------------
 * @description Increase the image count of tags
 * @param {Array|String} id Array of ids or single Id
 * @param {Number?} [number] Number by which to increment
 */
async function incrementUserByUserId(id, number = 1) {
    if (!Array.isArray(id)) id = [id]
    return User.increment({ uploads: +number }, { where: { id } })
}

/**
 * ----------------------------------------------------------------------------
 * @description Update user's username by Id
 * @param {*} id
 * @param {*} username
 * @returns {[error, User]}
 */
async function updateUserName(id, username) {
    return new Promise(async (resolve) => {
        try {
            const response = await User.update(
                { username },
                { where: { id, username: null }, returning: true, plain: true }
            )
            console.log("updated username", response)
            return resolve([null, response.dataValues])
        } catch (err) {
            console.log(err)
            return resolve([err.errors[0].message, null])
        }
    })
}

module.exports = {
    checkIfExistsOrCreate,
    getUsers,
    incrementUserByUserId,
    updateUserName,
}
