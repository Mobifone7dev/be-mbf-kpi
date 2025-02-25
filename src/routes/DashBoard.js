const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/DashboardControllers");
router.use("/dashboard-plan-kpi", dashboardController.getDashBoardPlanKpi);
router.use("/dashboard-exec-kpi", dashboardController.getDashBoardExecKpi);
router.use("/", dashboardController.index);

module.exports = router;
