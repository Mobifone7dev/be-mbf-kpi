const express = require("express");
const router = express.Router();
const controller = require("../controllers/DashboardThiduaController");
router.get("/thidua-mobiagri", controller.getThiduaMobiAgri);

router.use("/", controller.index);

module.exports = router;
