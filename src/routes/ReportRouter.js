const express = require("express");
const router = express.Router();
const controller = require("../controllers/ReportController");
router.get("/report-code-by-month", controller.getReportCodeByMonth);
router.use("/", controller.index);

module.exports = router;
