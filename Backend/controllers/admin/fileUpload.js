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
            .webp({ quality: 80 }) // You can adjust quality settings as needed
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
            const originalExtension = file.originalname.split(".").pop() || "";
            const baseName = _getName();
            let fileName;

            let buffer = file.buffer;
            if (allowedFormats.includes(file.mimetype)) {
                // Images -> always stored as WebP
                fileName = `${baseName}.webp`;
                params = {
                    Acl: "public-read",
                    Bucket: `${bucketName}/images`,
                    Key: fileName,
                    ContentType: "image/webp",
                    size: file.size
                };
                if(isDwarka){
                    buffer = await _resize(file.buffer, { width: 1519, height: 650 });
                }
                if(isProp){
                    buffer = await _resize(file.buffer, { width: 1200, height: 756 });
                }
            } else if (pdfAllowFormats.includes(file.mimetype)) {
                // PDFs -> keep original extension, no WebP conversion
                fileName = `${baseName}.${originalExtension || "pdf"}`;
                params = {
                    Bucket: `${bucketName}/pdfs`,
                    Key: fileName,
                    ContentType: "application/pdf",
                    size: file.size
                };
                buffer = file.buffer;
            } else if (videoAllowFormats.includes(file.mimetype)) {
                // Videos -> keep original extension, no WebP conversion
                fileName = `${baseName}.${originalExtension || "mp4"}`;
                params = {
                    Acl: "public-read",
                    Bucket: `${bucketName}/videos`,
                    Key: fileName,
                    ContentType: file.mimetype,
                    size: file.size
                };
                buffer = file.buffer;
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
