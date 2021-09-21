const { getImagesFromRedis } = require("../Utilities/redisOperations")

async function checkInCache(req, res, next) {
    const [_, cache] = await getImagesFromRedis(req.originalUrl)
    console.log("cache", req.originalUrl, cache)
    if (cache) return res.send({ status: 200, data: cache })
    next()
}

module.exports = { checkInCache }
