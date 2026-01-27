const sharp = require('sharp');
const Image = require('../../models/imageModel');
const FileType = require('file-type');
const AWS = require("aws-sdk");
const crypto = require("crypto");
require("dotenv").config();

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.REGION,
});

const s3Client = new AWS.S3();

const allowedFormats = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];
const pdfAllowFormats = ["application/pdf"];
const videoAllowFormats = ["video/mp4", "video/quicktime", "video/webm", "video/ogg"];

const _getName = () => crypto.randomBytes(15).toString('hex');

const _resize = async (data, params) => {
    try {
        return await sharp(data)
            .resize({
                width: params.width,
                height: params.height,
                fit: 'inside', // Maintain aspect ratio, fit the resized image within the specified dimensions
                withoutEnlargement: true // Do not enlarge the image if smaller than the specified dimensions
            })
            .jpeg({ quality: 80 }) // You can adjust quality settings as needed
            .toBuffer();
    } catch (e) {
        throw e;
    }
};

const uploadFilesToS3 = async (req, res, bucketName, isDwarka, isProp) => {
    const promiseArray = [];
    const { real_name } = req.body;
    try {
        for (const file of req.files) {
            let params = {};
            let fileExtension = file.originalname.split(".").pop();
            let fileName = `${_getName()}.${fileExtension}`;

            let buffer = file.buffer;
            if (allowedFormats.includes(file.mimetype)) {
                params = {
                    Acl: "public-read",
                    Bucket: `${bucketName}/images`,
                    Key: fileName,
                    size: file.size
                };
                if(isDwarka){
                    buffer = await _resize(file.buffer, { width: 1519, height: 650 });
                }
                if(isProp){
                    buffer = await _resize(file.buffer, { width: 1200, height: 756 });
                }
            } else if (pdfAllowFormats.includes(file.mimetype)) {
                params = {
                    Bucket: `${bucketName}/pdfs`,
                    Key: fileName,
                    Body: file.buffer,
                    size: file.size
                };
            } else if (videoAllowFormats.includes(file.mimetype)) {
                params = {
                    Acl: "public-read",
                    Bucket: `${bucketName}/videos`,
                    Key: fileName,
                    Body: file.buffer,
                    size: file.size
                };
            } else {
                console.log(`Skipping file ${file.originalname} due to unsupported format.`);
                continue; // Skip unsupported formats
            }
            const putObjectPromise = s3Client.upload({ ...params, Body: buffer }).promise();
            promiseArray.push(putObjectPromise);
        }

        const uploadedFiles = await Promise.all(promiseArray);

        const fileData = uploadedFiles.map((value) => ({
            name: value.key,
            real_name: real_name || value.key,
            s3_link: value.Location,
            isDwarka: isDwarka,
            isProp: isProp
        }));

        const insertedFiles = await Image.insertMany(fileData);
        res.status(200).json(insertedFiles);
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Internal server error" });
    }
};

module.exports = { uploadFilesToS3 };
