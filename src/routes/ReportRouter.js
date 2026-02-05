const express = require("express");
const router = express.Router();
const controller = require("../controllers/ReportController");
router.get("/report-code-by-vlr", controller.getReportCodeByMonth);
router.get("/report-code-by-vlr-detail", controller.getReportCodeByMonthDetail);
router.use("/", controller.index);
module.exports = router;
