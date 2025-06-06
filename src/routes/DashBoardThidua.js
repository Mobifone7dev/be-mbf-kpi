const express = require("express");
const router = express.Router();
const controller = require("../controllers/DashboardThiduaController");
router.get("/sl-thidua-mobiagri", controller.getSoluongPTMThiduaMobiAgri);
router.get("/dt-thidua-mobiagri", controller.getDoanhthuPTMThiduaMobiAgri);
router.get("/sl-thidua-m2m", controller.getSoluongPTMThiduaM2M);
router.get("/dthu-thidua-cloud", controller.getDoanhthuCloud);
router.get("/dthu-thidua-iot", controller.getDoanhthuIOT);
router.get("/dthu-thidua-iot-detail", controller.getDoanhthuIOTDetail);
router.get("/dthu-thidua-cloud-detail", controller.getDoanhthuCloudDetail);
router.post("/dthu-thidua-iot", controller.createManualListIOT);
router.post("/dthu-thidua-cloud", controller.createManualListCloud);
router.use("/", controller.index);

module.exports = router;
