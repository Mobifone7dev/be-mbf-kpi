

const fs = require("fs");
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const https = require('https')
const hsts = require('hsts')
const helmet = require('helmet');
const app = express();
const PORT = 8104;
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "google.com", "ajax.googleapis.com"],
    styleSrc: ["'self'", "maxcdn.bootstrapcdn.com"],
    imgSrc: ["'self'", "tracuu7.mobifone.vn"],
    connectSrc: ["'self'", "tracuu7.mobifone.vn"],
    fontSrc: ["'self'", "fonts.gstatic.com"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  },
};
app.use(helmet.contentSecurityPolicy(cspConfig));
app.use(
  helmet.hsts({
    maxAge: 31536000,        // 1 năm
    includeSubDomains: true, // áp dụng cả subdomain
    preload: true,           // cho preload list
  })
);
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
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

// var certificate = fs.readFileSync('/usr/local/ssl/certificate/tracuu7/cert_chonso7_271025.crt');
// var privateKey = fs.readFileSync('/usr/local/ssl/certificate/tracuu7/chonso7_private_key_271025.key')
// app.use((req, res, next) => {
//   const allowedOrigins =
//     ['https://tracuu7.mobifone.vn',
//       'https://tracuu7.mobifone.vn:8101',
//       'https://tracuu7.mobifone.vn:443',
//       'https://tracuu7.mobifone.vn:8111',
//       'https://tracuu7.mobifone.vn:8103',
//       'http://localhost:8111',
//     ];
//   if (allowedOrigins.indexOf(req.headers.origin) !== -1) {
//     res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//     res.header('Access-Control-Allow-Credentials', true);
//   }
//   return next();
// });

// app.use(function (req, res, next) {
//   if (req.secure) {
//     res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
//   }
//   next();
// })


// https.createServer({
//   key: privateKey,
//   cert: certificate
// }, app).listen(PORT)

app.listen(PORT);

