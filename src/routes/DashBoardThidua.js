const express = require("express");
const router = express.Router();
const controller = require("../controllers/DashboardThiduaController");
router.get("/sl-thidua-mobiagri", controller.getSoluongPTMThiduaMobiAgri);

router.use("/", controller.index);

module.exports = router;
