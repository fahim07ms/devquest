import multer from "multer";

// Configure multer for using memory storage
const storage = multer.memoryStorage();

// File filter to except only image files
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
}

// Create a multer instance with the storage and file filter
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB limit
    }
});
