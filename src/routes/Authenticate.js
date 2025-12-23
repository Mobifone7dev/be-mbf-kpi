const express = require("express");
const router = express.Router();
const authenticateController = require("../controllers/AuthenticateController");
router.post("/change-password", authenticateController.changPassword);
router.post("/logout", authenticateController.logout);
router.use("/", authenticateController.index);

module.exports = router;
