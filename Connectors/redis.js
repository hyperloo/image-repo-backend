const redis = require("redis")
const { redisConfig } = require("../Configs")

function connectToRedis() {
    global.redisClient = redis.createClient(redisConfig)

    redisClient.on("error", (err) => {
        console.error("Error while connecting Redis: ", err)
    })

    redisClient.on("connect", () => {
        console.log("Redis Connection established successfully")
    })
}

module.exports = { connectToRedis }
