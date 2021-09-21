/**
 * ----------------------------------------------------------------------------
 * @description Check for any username present in the redis
 * @param username
 * @returns [err, data]
 */
function checkUserInRedis(username) {
    return new Promise((resolve) => {
        redisClient.exists(username, (err, data) => {
            if (err) return resolve([JSON.stringify(err), null])
            else if (data === 1) return resolve(["Username already exists", null])
            else return resolve([null, {}])
        })
    })
}

/**
 * ----------------------------------------------------------------------------
 * @description Set Username to true in redis client
 * @param username
 * @returns [err, data]
 */
function setUsernameInRedis(username) {
    return new Promise((resolve) => {
        redisClient.set(username, true, (err, data) => {
            if (err) return resolve([JSON.stringify(err), null])
            else return resolve([null, data])
        })
    })
}

/**
 * ----------------------------------------------------------------------------
 * @description Set Image data to the redis
 * @param {*} key
 * @param {*} value
 * @param {Number?} time
 */
function setImagesInRedis(key, value, time = 10) {
    const stringValue = JSON.stringify(value)
    redisClient.setex(key, time, stringValue, (err) => {})
}

/**
 * ----------------------------------------------------------------------------
 * @description Get Image data from the redis
 * @param {*} key
 */
function getImagesFromRedis(key) {
    return new Promise((resolve) => {
        redisClient.get(key, (err, data) => {
            console.log("key: ", key, " value: ", data)
            if (err) return resolve([JSON.stringify(err), null])
            else if (data === null) return resolve([null, null])

            const value = JSON.parse(data)
            return resolve([null, value])
        })
    })
}

module.exports = {
    checkUserInRedis,
    setUsernameInRedis,
    setImagesInRedis,
    getImagesFromRedis,
}
