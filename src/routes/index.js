require("dotenv").config();
const jwt = require("jsonwebtoken");
const dashboardRouter = require("./DashBoard");
const dashboardThiduaRouter = require("./DashBoardThidua");
const authenticateRouter = require("./Authenticate");
const userRoleRouter = require("./UserRole");


function route(app) {
  app.get("/", function (req, res) {
    res.send("Hello World!"); // This will serve your request to '/'.
  });
  app.post("/login", authenticateRouter);
  app.use("/dashboard", authenticateToken, dashboardRouter);
  app.use("/user-role", authenticateToken, userRoleRouter);
  app.use("/dashboard-thidua", dashboardThiduaRouter);

}
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
module.exports = route;
