const router = require("express").Router();
const ctrl   = require("../controllers/report.controller");
const { protect, uploadReport } = require("../middleware/index");

router.use(protect);
router.post("/",        uploadReport.single("report"), ctrl.uploadReport);
router.get ("/",        ctrl.getMyReports);
router.get ("/:id",     ctrl.getReport);
router.get ("/:id/file", ctrl.getReportFile);
router.delete("/:id",   ctrl.deleteReport);

module.exports = router;
