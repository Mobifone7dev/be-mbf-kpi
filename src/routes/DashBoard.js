const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/DashboardControllers");
router.use("/top-employees", dashboardController.getTopEmployees);
router.use("/top-services", dashboardController.getTopServices);
router.use("/summaryOfYear", dashboardController.getSummaryOfYear);
router.use("/summaryOfMonth", dashboardController.getSummaryOfMonth);
router.use("/dashboard-view-count", dashboardController.getDashBoardViewCount);
router.post("/dashboard-add-count/", dashboardController.addCountToDashboard);
router.use(
  "/dashboard-by-shop-code",
  dashboardController.getDashboardByShopCode
);
router.use("/dashboard-employee", dashboardController.getDashboardEmployee);

router.use("/", dashboardController.index);

module.exports = router;
