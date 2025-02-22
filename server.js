

const fs = require("fs");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const app = express();
const PORT = 8110;
app.use(cors());
app.use(morgan("combined"));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
const route = require("./src/routes");
route(app);
app.use("/public", express.static(path.join(__dirname, "public")));
app.listen(PORT);

