const router = require("express").Router();
const ctrl   = require("../controllers/appointment.controller");
const { protect, authorize } = require("../middleware/index");

router.use(protect);
router.get ("/doctors",  ctrl.listDoctors);
router.post("/",         ctrl.bookAppointment);
router.get ("/",         ctrl.getMyAppointments);
router.get ("/doctor",   authorize("doctor","admin"), ctrl.getDoctorAppointments);
router.put ("/:id/status", authorize("doctor","admin"), ctrl.updateAppointmentStatus);

module.exports = router;
