const express = require("express");
const router = express.Router();
const authenticateController = require("../controllers/Authenticate_Controller");
router.use("/", authenticateController.index);

module.exports = router;
