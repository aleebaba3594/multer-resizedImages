const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
app.use(cors());

// Define storage configurations for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dirSite = './uploads/forSite';
    const dirDashboard = './uploads/forDashboard';
    if (!fs.existsSync(dirSite)) {
      fs.mkdirSync(dirSite, { recursive: true });
    }
    if (!fs.existsSync(dirDashboard)) {
      fs.mkdirSync(dirDashboard, { recursive: true });
    }
    cb(null, dirSite); // Set default destination folder to "forSite"
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const dashboardStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dirDashboard = './uploads/forDashboard';
    if (!fs.existsSync(dirDashboard)) {
      fs.mkdirSync(dirDashboard, { recursive: true });
    }
    cb(null, dirDashboard);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}-resized.jpg`);
  }
});

const siteStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dirSite = './uploads/forSite';
    if (!fs.existsSync(dirSite)) {
      fs.mkdirSync(dirSite, { recursive: true });
    }
    cb(null, dirSite);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}-resized.jpg`);
  },
});

// Define multer instances for each storage configuration
const upload = multer({
  storage: storage,
});
const dashboardUpload = multer({ storage: dashboardStorage });
const siteUpload = multer({ storage: siteStorage });

// Define a single route to handle file uploads
app.post('/upload', upload.single('file'), function (req, res) {
  const file = req.file;
  // check the file types
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (!mimetype || !extname) {
    fs.unlinkSync(file.path); // Delete the uploaded file
    return res.send({ error: 'Only JPEG, JPG, and PNG files are allowed' });
  } else {
    // Resize image for "forSite" folder
    const resizedPicForSite = path.join('./uploads/forSite', `${file.filename}-resized.jpg`);
    sharp(file.path)
      .resize(600, 100) //first is height second is width
      .toFile(resizedPicForSite, function (err, info) {
        if (err) {
          res.send({ err, error: 'Error resizing image' });
        } else {
          console.log(info);
          // Rename resized image file to overwrite original file
          fs.rename(resizedPicForSite, file.path, function (err) {
            if (err) {
              res.send({ err, error: 'Error replacing original file' });
            } else {
              res.send({ filename: `${file.filename}` });
            }
          });
        }
      });

    // Resize image for "forDashboard" folder
    const resizedPicForDashboard = path.join('./uploads/forDashboard', `${file.filename}-resized.jpg`)
    sharp(file.path)
      .resize(100, 600) //first is height second is width
      .toFile(resizedPicForDashboard, function (err, info) {
        if (err) {
          console.log(err);
        } else {
          console.log(info);
        }
      });
  }
});

app.listen(3001, function () {
  console.log('Server started on port 3001');
});
