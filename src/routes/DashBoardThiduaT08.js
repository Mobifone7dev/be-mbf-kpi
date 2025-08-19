const express = require("express");
const router = express.Router();
const controller = require("../controllers/DashboardThiduaT08Controller");

router.get("/dthu-thidua-ltt", controller.getDoanhthuLTT);
router.get("/dthu-thidua-camera", controller.getDoanhthuCamera);
router.get("/dthu-thidua-camera-sl", controller.getSoLuongCamera);
router.get("/dthu-thidua-camera-detail", controller.getDoanhthuCameraDetail);
router.get("/sl-thidua-camera-detail", controller.getSoLuongCameraDetail);
router.get("/dthu-thidua-ltt-detail", controller.getDoanhthuLTTDetail);
router.post("/dthu-thidua-camera", controller.createManualListCamera);
router.post("/sl-thidua-camera", controller.createManualListCameraSL);
router.post("/dthu-thidua-ltt", controller.createManualListLTT);
router.use("/", controller.index);

module.exports = router;
