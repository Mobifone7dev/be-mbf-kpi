const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/DashboardControllers");
router.use("/dashboard-plan-kpi", dashboardController.getDashBoardPlanKpi);
router.use("/dashboard-plan-kpi-dla", dashboardController.getDashBoardPlanKpiDLA);
router.use("/dashboard-plan-kpi-dla-nhan-vien", dashboardController.getDashBoardPlanKpiDLAEmployee);
router.use("/dashboard-exec-kpi", dashboardController.getDashBoardExecKpi);
router.use("/dashboard-exec-kpi-dla", dashboardController.getDashBoardExecKpiDLA);
router.get("/dashboard-exec-kpi-dla-nhan-vien", dashboardController.getDashBoardExecKpiDLAEmployee);
router.post("/dashboard-create-manual-kpi", dashboardController.createManualKpi);
router.post("/dashboard-create-manual-list-kpi", dashboardController.createManualListKpi);
router.post("/dashboard-create-manual-list-kpi-dla", dashboardController.createManualListKpiDLA);
router.post("/dashboard-create-manual-list-kpi-dla-nhan-vien", dashboardController.createManualListKpiDLAEmployee);
router.get("/dashboard-export-excel-exec-kpi", dashboardController.exportExcelExecKpi);
router.get("/dashboard-search-employee-by-area", dashboardController.searcEmployeebyArea);
router.get("/dashboard-search-employee-by-empcode", dashboardController.searcEmployeeByEmpcode);
router.use("/", dashboardController.index);

module.exports = router;
