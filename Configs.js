require("dotenv").config()

const allowedOrigins = ["http://localhost:3000"]

const corsConfig = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true)
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg =
                "The CORS policy for this site does not " +
                "allow access from the specified Origin."
            return callback(new Error(msg), false)
        }
        return callback(null, true)
    },
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
    "Access-Control-Allow-Credentials": true,
}

const mySQLBaseConfig = [
    process.env.MYSQL_DB_NAME,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
]

const mySQLConfig = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    multipleStatements: true,
    dialect: "mysql",
    operatorAliases: false,

    dialectOptions: {
        connectTimeout: 31536000,
        supportBigNumbers: true,
        bigNumberStrings: true,
    },

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
}

const clarifaiConfig = {
    userId: process.env.CLARIFAI_USER_ID,
    key: process.env.CLARIFAI_API_KEY,
    bucket: process.env.CLARIFAI_BUCKET_NAME,
}

const OAuthConfig = {
    clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_BASE_URL}/api/auth/google/callback`,
}

const cookieConfig = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    keys: [`${process.env.COOKIE_SECRET}`],
    resave: true,
    rolling: true,
    saveUninitialized: false,
    overwrite: true,
}

const redisConfig = {
    host: `${process.env.REDIS_CONNECTION_URL}`,
    port: `${process.env.REDIS_PORT}`,
    password: `${process.env.REDIS_PASSWORD}`,
}

const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
}

module.exports = {
    mySQLConfig,
    corsConfig,
    mySQLBaseConfig,
    clarifaiConfig,
    OAuthConfig,
    cookieConfig,
    redisConfig,
    awsConfig,
}
