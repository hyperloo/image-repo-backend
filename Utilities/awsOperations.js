const aws = require("aws-sdk")
const { awsConfig } = require("../Configs")
const s3 = new aws.S3(awsConfig)
const { v4 } = require("uuid")

const awsParams = {
    Bucket: "learnerimagesbucket",
}

/**
 * ----------------------------------------------------------------------------
 * @description Get an array of presigned Urls of type Put
 * @param {Number} uploads Number of presigned Urls
 */
function putPresignedUrl(uploads = 1) {
    let presignedUrls = []
    let signedType = "putObject"

    return new Promise(async (resolve) => {
        try {
            for (let i = 0; i < uploads; i++) {
                const Key = v4()
                const url = await s3.getSignedUrlPromise(signedType, {
                    ...awsParams,
                    Expires: 30,
                    Key,
                    ACL: "public-read",
                })
                presignedUrls.push({ url, key: Key })
                if (i === uploads - 1) return resolve([null, presignedUrls])
            }
        } catch (err) {
            console.error(err)
            if (err) return resolve([JSON.stringify(err), null])
        }
    })
}

/**
 * ----------------------------------------------------------------------------
 * @description Get an array of presigned Urls of type Get
 * @param {[String]} key Key of Image
 */
function getPresignedUrl(key) {
    let presignedUrls = []
    let signedType = "getObject"

    return new Promise(async (resolve) => {
        try {
            for (let i = 0; i < key.length; i++) {
                const url = await s3.getSignedUrlPromise(signedType, {
                    ...awsParams,
                    Key: key[i],
                })
                presignedUrls.push({ url, key: key[i] })
                if (i === key.length - 1) return resolve([null, presignedUrls])
            }
        } catch (err) {
            console.error(err)
            if (err) return resolve([JSON.stringify(err), null])
        }
    })
}

module.exports = { getPresignedUrl, putPresignedUrl }
