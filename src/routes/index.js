require("dotenv").config();
const jwt = require("jsonwebtoken");
const dashboardRouter = require("./DashBoard");
const dashboardThiduaRouter = require("./DashBoardThidua");
const dashboardThiduaT08Router = require("./DashBoardThiduaT08");
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
  app.use("/dashboard-thidua-t08", dashboardThiduaT08Router);
  app.use("/authentication", authenticateRouter);


}
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = user;
    next(); // ✅ CHỈ GỌI 1 LẦN
  });
}
module.exports = route;
