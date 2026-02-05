const express = require("express");
const router = express.Router();
const controller = require("../controllers/ReportController");
router.get("/report-code-by-vlr", controller.getReportCodeByMonth);
router.use("/", controller.index);
module.exports = router;
