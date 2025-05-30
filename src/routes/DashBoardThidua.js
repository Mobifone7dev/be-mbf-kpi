const express = require("express");
const router = express.Router();
const controller = require("../controllers/DashboardThiduaController");
router.get("/sl-thidua-mobiagri", controller.getSoluongPTMThiduaMobiAgri);
router.get("/dt-thidua-mobiagri", controller.getDoanhthuPTMThiduaMobiAgri);
router.get("/sl-thidua-m2m", controller.getSoluongPTMThiduaM2M);


router.use("/", controller.index);

module.exports = router;
