const express = require("express");
const compression = require('compression');
const cors = require("cors");
const bodyParser = require('body-parser');
const connectDB = require("./config/db");
const { notFound, errorHandle } = require("./middleware/errorMiddleware");
const validateEnv = require("./config/envValidation");
const app = express();
const AWS = require("aws-sdk");
const contactFormRouter = require("./routes/client/contactFormRouter");
const sheetRouter = require("./routes/client/sheetRouter");
const adminRoutes = require("./routes/admin/index")
const clientRoutes = require("./routes/client/index")
require("dotenv").config();

// Validate environment variables before starting
validateEnv();
connectDB();


// -----------------aws-s3------------------------

const s3Client = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.REGION,
});

app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(contactFormRouter);

const allowAllOrigins = process.env.ALLOWED_ORIGINS === '*';
const allowedOriginsRaw = process.env.ALLOWED_ORIGINS && !allowAllOrigins
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim().replace(/\/+$/, ''))
  : ["http://localhost:4028", "http://localhost:3000", "https://namohomes-admin-lts.vercel.app", "https://namohomes-admin.vercel.app", "https://admin.namohomesindia.com", "https://namohomesindia.com", "https://www.namohomesindia.com"];

const allowedOrigins = [...new Set(allowedOriginsRaw.filter(Boolean))];

app.use(cors({
  origin: function (origin, callback) {
    if (allowAllOrigins) return callback(null, true);
    if (!origin) return callback(null, true);
    const originNormalized = origin.replace(/\/+$/, '');
    const isAllowed = allowedOrigins.includes(originNormalized);
    if (isAllowed || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const multer = require("multer");
const jwtAdminVerify = require("./middleware/authMiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const allowedFormats = [
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",
];
const pdfAllowFormats = ["application/pdf"];
const videoAllowFormats = ["video/mp4", "video/quicktime", "video/webm", "video/ogg"];

app.post("/upload-image", upload.array("files"), (req, res) => {
  const promiseArray = [];
  req.files.forEach((file) => {
    // Check if the file format is allowed
    if (pdfAllowFormats.includes(file.mimetype)) {
      // Generate a unique filename for the uploaded file
      const fileExtension = file.originalname.split(".").pop();
      const uniqueFileName = `file-${Date.now()}.${fileExtension}`;

      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `uploads/${uniqueFileName}`, // Specify the desired path and filename in your bucket
        Body: file.buffer,
      };

      const putObjectPromise = s3Client.upload(params).promise();
      promiseArray.push(putObjectPromise);
    }
    else if (allowedFormats.includes(file.mimetype)) {
      const params = {
        Acl: "public-read",
        Bucket: `${process.env.BUCKET_NAME}/images`,
        Key: `image-${Date.now()}.${file.originalname.split(".").pop()}`,
        Body: file.buffer,
      };
      const putObjectPromise = s3Client.upload(params).promise();
      promiseArray.push(putObjectPromise);
    }
    else if (videoAllowFormats.includes(file.mimetype)) {
      // Handle video files
      const params = {
        Acl: "public-read",
        Bucket: `${process.env.BUCKET_NAME}/videos`,
        Key: `video-${Date.now()}.${file.originalname.split(".").pop()}`,
        Body: file.buffer,
      };
      const putObjectPromise = s3Client.upload(params).promise();
      promiseArray.push(putObjectPromise);
    }
    else {
      console.log(
        `Skipping file ${file.originalname} due to unsupported format.`
      );
    }
  });

  Promise.all(promiseArray)
    .then((values) => {
      const urls = values.map((value) => value.Location);
      res.send(urls);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});
// Health check endpoint for production monitoring
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});
//-----------------aws-s3------------------------
app.use("/api/admin", jwtAdminVerify, adminRoutes);
app.use("/api/client", clientRoutes);
app.use("/api", sheetRouter);

app.use(notFound);
app.use(errorHandle);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  () => {
    console.log(`Server started on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  }
);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    // Close database connections
    const mongoose = require('mongoose');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

