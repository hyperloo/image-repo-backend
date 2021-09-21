global.passport = require("passport")
const { OAuthConfig } = require("../Configs")
var GoogleStrategy = require("passport-google-oauth20").Strategy
const { checkIfExistsOrCreate, getUsers } = require("../Utilities/UserOperations")

function googleOAuth() {
    passport.use(
        new GoogleStrategy(
            {
                ...OAuthConfig,
            },
            async function (_, _, profile, done) {
                console.log("Oauth")
                try {
                    const [err, user] = await checkIfExistsOrCreate(
                        profile.id,
                        profile
                    )
                    console.log(user)
                    if (err) throw err
                    return done(null, user)
                } catch (err) {
                    console.error(err)
                    return done(null, null)
                }
            }
        )
    )

    passport.serializeUser((user, done) => {
        console.log("Serialize")
        done(null, { ...user })
    })

    passport.deserializeUser(async (user, done) => {
        console.log("Deserialize", user)
        done(null, user)
    })
}

module.exports = { googleOAuth }
