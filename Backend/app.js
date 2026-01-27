const express = require("express");
const compression = require('compression');
const cors = require("cors");
const bodyParser = require('body-parser');
const connectDB = require("./config/db");
const { notFound, errorHandle } = require("./middleware/errorMiddleware");
const userRoute = require("./routes/admin/userRoutes");
const countryRoute = require("./routes/admin/countryRoutes");
const stateRoute = require("./routes/admin/stateRoutes");
const imageUploadRouter = require("./routes/admin/imageUploadRoutes");
const cityRouter = require("./routes/admin/cityRoutes");
const microlocationRouter = require("./routes/admin/microLocationRoutes");
const amenityRouter = require("./routes/admin/amenitiesRoutes");
const propertytypeRouter = require("./routes/admin/propertyTypeRoutes");
const seoRouter = require("./routes/admin/seoRoutes");
const builderRouter = require("./routes/admin/builderRoutes");
const builderProjectRouter = require("./routes/admin/builderProjectRoutes");
const clientCityRoutes = require("./routes/client/cityRoutes");
const clientcountryRoutes = require("./routes/client/countryRoutes");
const clientMicrolocationRoutes = require("./routes/client/microlocationRoutes");
const clientStateRoutes = require("./routes/client/stateRoutes");
const ourClientRouter = require("./routes/admin/ourClientRoutes");
const clientRouter = require("./routes/client/ourClientsRoutes");
const clientSeoRouter = require("./routes/client/seoRoutes");
const app = express();
const AWS = require("aws-sdk");
const contactFormRouter = require("./routes/client/contactFormRouter");
const MediaRouter = require("./routes/admin/mediaRoutes")
const seoDwarkaRouter = require("./routes/admin/seoDwarkaRoutes")
const newLaunchRouter = require("./routes/admin/newLaunchRoutes")
const adminRoutes = require("./routes/admin/index")
const clientRoutes = require("./routes/client/index")
const { protect } = require("./middleware/authMiddleware")
require("dotenv").config();
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
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(contactFormRouter);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // change * to your domain in production
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
const multer = require("multer");

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
const GAS_URL = "https://script.google.com/macros/s/AKfycbyj-PR0KgZNvKNidgixI8i-YDHfaMgfb8m57zoEGUVB0EDiP0f3CkYL7-VZYtEWYs8vkA/exec";
app.post("/api/sheet", async (req, res) => {
  try {
    const resp = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await resp.text();
    // try parse JSON, otherwise forward text
    try {
      const json = JSON.parse(text);
      res.status(resp.status).json(json);
    } catch (e) {
      res.status(resp.status).send(text);
    }
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});
app.get("/", (req, res) => {
  res.send("API is running for namohomes...");
});
//-----------------aws-s3------------------------
app.use("/api/admin", adminRoutes);
app.use("/api/client", clientRoutes);
// app.use("/api/user", userRoute);
// app.use("/api/allCountry", countryRoute);
// app.use("/api/state", stateRoute);
// app.use("/api/image", imageUploadRouter);
// app.use("/api/city", cityRouter);
// app.use("/api/microlocation", microlocationRouter);
// app.use("/api/amenity", amenityRouter);
// app.use("/api/propertytype", propertytypeRouter);
// app.use("/api/seo", seoRouter);
// app.use("/api/builder", builderRouter);
// app.use("/api/project", builderProjectRouter);
// app.use("/api/ourClient", ourClientRouter);
// app.use("/api", clientCityRoutes);
// app.use("/api/micro-location", clientMicrolocationRoutes);
// app.use("/api", clientStateRoutes);
// app.use("/api", clientcountryRoutes);
// app.use("/api/client", clientRouter);
// app.use("/api/seo", clientSeoRouter);
// app.use("/api", MediaRouter)
// app.use("/api/dwarka", seoDwarkaRouter)
// app.use("/api/user", dwarkaProjectUserRouter)
// app.use("/api/newlaunch", newLaunchRouter)
app.use(notFound);
app.use(errorHandle);

app.listen(
  process.env.PORT,
  console.log(`server started on ${process.env.PORT}`)
);
