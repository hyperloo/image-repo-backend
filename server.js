const express = require("express")
const helmet = require("helmet")
const cors = require("cors")
const cookieSession = require("cookie-session")

const { cookieConfig } = require("./Configs")
const { connectToDB } = require("./Connectors/Db")
const { connectToRedis } = require("./Connectors/redis")
const { googleOAuth } = require("./Connectors/OAuth")

require("dotenv").config()
const { corsConfig } = require("./Configs")

/***** Router routes *********/
const authRouter = require("./routes/auth")
const userRouter = require("./routes/user")
const imageRouter = require("./routes/image")
const tagRouter = require("./routes/tag")
const awsRouter = require("./routes/aws")

const app = express()
app.use(cors(corsConfig))

/***** Initializing Security Parameters ******/
app.use(helmet.permittedCrossDomainPolicies())
app.use(helmet.xssFilter())

app.use(helmet.dnsPrefetchControl({ allow: true }))
app.use(helmet.frameguard({ action: "sameorigin" }))
app.use(helmet.hidePoweredBy({ setTo: "express" }))
app.use(helmet.hsts({ maxAge: 2592000 })) //30 days max age

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

/*------------ DB Connections -------------*/
/***** Initializing Redis ********/
connectToRedis()
/***** Initializing MYSQL DB ********/
connectToDB()
/*-----------------------------------------*/

/***** cookie session initialization ************/
app.use(cookieSession(cookieConfig))

/***** Initializing Oauth using Passport *********/
googleOAuth()
app.use(passport.initialize())
app.use(passport.session())

/**** Route based middlewares *******/
app.use("/api/user", userRouter)
app.use("/api/auth", authRouter)
app.use("/api/image", imageRouter)
app.use("/api/tag", tagRouter)
app.use("/api/aws", awsRouter)

/***** Error Handling *****/
process.on("uncaughtException", (err) => {
    console.error(err)
    //Catching DB Connection lost error
    if (err.code == "PROTOCOL_CONNECTION_LOST") connectToDB()
    else {
        sqlDb.end()
        process.exit(1)
    }
})

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Server Started on port ${port}`))
