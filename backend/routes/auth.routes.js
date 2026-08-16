const router = require("express").Router();
const ctrl   = require("../controllers/auth.controller");
const { protect } = require("../middleware/index");

router.post("/register",          ctrl.register);
router.post("/login",             ctrl.login);
router.post("/link-telegram-otp", ctrl.linkTelegramOTP);
router.get ("/me",                protect, ctrl.getMe);
router.post("/request-otp",       protect, ctrl.requestOTP);
router.post("/verify-otp",        protect, ctrl.verifyOTP);

module.exports = router;
