const jwt        = require("jsonwebtoken");
const User       = require("../models/User.model");
const cloudinary = require("../config/cloudinary");
const multer     = require("multer");

const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : req.query.token;
    if (!token) return res.status(401).json({ success:false, message:"Token missing" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select("-password -otp");
    if (!user || !user.isActive) return res.status(401).json({ success:false, message:"User not found" });
    req.user = user;
    next();
  } catch { return res.status(401).json({ success:false, message:"Invalid token" }); }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success:false, message:"Access denied" });
  next();
};

const uploadReport = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10*1024*1024 } });
const uploadAudio  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25*1024*1024 } });

function uploadToCloudinary(buffer, options={}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: options.folder||"ruralcare/reports", resource_type: options.resource_type||"auto" },
      (err, result) => err ? reject(err) : resolve(result)
    );
    const { Readable } = require("stream");
    const r = new Readable(); r.push(buffer); r.push(null); r.pipe(stream);
  });
}

module.exports = { protect, authorize, uploadReport, uploadAudio, uploadToCloudinary };
