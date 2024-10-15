import multer from "multer";
import crypto from "crypto";
import path from "path";

// Configure storage for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination for file uploads
    cb(null, './public/images/uploads');
  },
  filename: function (req, file, cb) {
    // Generate a random filename using crypto
    crypto.randomBytes(12, (err, buffer) => {
      if (err) {
        return cb(err);
      }
      // Create the filename with a random hex string and the original file extension
      const fn = buffer.toString('hex') + path.extname(file.originalname);
      
      cb(null, fn);
    });
  }
});

// Initialize Multer with the storage configuration
const upload = multer({ storage: storage });

// Export the upload middleware
export default upload;
