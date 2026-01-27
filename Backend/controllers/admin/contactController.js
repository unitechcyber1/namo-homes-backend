const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const contactform = asyncHandler((req, res) => {
    const { name, email, phone, looking, PageLocation, city, location } =
    req.body;
    try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
          },
          secure: true,
        });
        let emailContent;
        if (looking) {
          emailContent = `<ul>
          <li>Name: ${name}</li>
          <li>Email: ${email}</li>
          <li>Phone: ${phone}</li>
          <li>Looking for: ${looking}</li>
          <li>City: ${city}</li>
          <li>Page Location: ${PageLocation}</li>
        </ul>`;
        } else {
          emailContent = `<ul>
          <li>Name: ${name}</li>
          <li>Email: ${email}</li>
          <li>Phone: ${phone}</li>
          <li>City: ${city}</li>
          <li>Location: ${location}</li>
          <li>Page Location: ${PageLocation}</li>
        </ul>`;
        }
    
        const mailOptions = {
          from: email,
          to: process.env.EMAIL,
          subject: "Query from Propularity",
          html: emailContent,
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("Error", error);
          } else {
            res.status(201).json({ status: 201, info });
          }
        });
      } catch (error) {
        res.status(401).json({ status: 401, error });
      }
})
const dwarkaContactform = asyncHandler((req, res) => {
    const { name, email, phone, looking, PageLocation, city, location } =
    req.body;
    try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
          },
          secure: true,
        });
        let emailContent;
        if (looking) {
          emailContent = `<ul>
          <li>Name: ${name}</li>
          <li>Email: ${email}</li>
          <li>Phone: ${phone}</li>
          <li>Looking for: ${looking}</li>
          <li>City: ${city}</li>
          <li>Page Location: ${PageLocation}</li>
        </ul>`;
        } else {
          emailContent = `<ul>
          <li>Name: ${name}</li>
          <li>Email: ${email}</li>
          <li>Phone: ${phone}</li>
          <li>City: ${city}</li>
          <li>Location: ${location}</li>
          <li>Page Location: ${PageLocation}</li>
        </ul>`;
        }
    
        const mailOptions = {
          from: email,
          to: process.env.EMAIL,
          subject: "Query from Dwarkaexpressway",
          html: emailContent,
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("Error", error);
          } else {
            res.status(201).json({ status: 201, info });
          }
        });
      } catch (error) {
        res.status(401).json({ status: 401, error });
      }
})


module.exports = {contactform, dwarkaContactform};