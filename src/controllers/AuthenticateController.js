require("dotenv").config();
const jwt = require("jsonwebtoken");
const ldap = require("ldapjs");
const DbConnection = require("../../DbConnection");
const { sequelize } = require('../models'); // Import s
const { HttpsProxyAgent } = require("https-proxy-agent");
const proxy = "http://10.39.152.30:3128";
const agent = new HttpsProxyAgent(proxy);
(async () => {
  try {
    const fetch = (await import("node-fetch")).default; // 👈 import động
    const res = await fetch("https://www.google.com", { agent });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body sample:", text.substring(0, 200)); // in thử 200 ký tự đầu
  } catch (err) {
    console.error("Fetch error:", err);
  }
})();
class Authenticate_Controller {
  async index(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const captchaToken = req.body.captchaToken;
    const user = { name: username };
    if (!captchaToken) {
      return res.status(400).json({ error: "Captcha token is required" });
    }
    // Verify captcha
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const fetch = (await import("node-fetch")).default; // 👈 import động
    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
      agent,
    });

    const data = await response.json();
    if (!data.success || (data.score && data.score < 0.5)) {
      return res.status(400).json({ error: "Captcha verification failed" });
    }
    console.log("process.env.LDAP_URI", process.env.LDAP_URI);
    if (username && password) {
      var client = ldap.createClient({
        url: process.env.LDAP_URI,
        timeout: 5000,
        connectTimeout: 10000,
      });
      client.bind(username, password, async (err) => {
        client.unbind();
        if (err) {
          console.log(err);
          res.sendStatus(401);
        } else {
          const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "10d",
          });
          try {
            const existingUserEmail = await sequelize.query(
              `SELECT * FROM web_user where 
              user_email = :username
             `,
              {
                replacements: { username: username },
                type: sequelize.QueryTypes.SELECT,
              });
            if (existingUserEmail.length == 0) {
              const userNamePrefix = username.split("@")[0];
              await sequelize.query(
                `insert into web_user (user_email, user_name, status) 
                     values(
                    :username,
                    :userNamePrefix,
                    1
                     ) 
                     `,
                {
                  replacements: { username: username, userNamePrefix: userNamePrefix },
                  type: sequelize.QueryTypes.INSERT,
                });
            }



            const queryRoles = await sequelize.query(
              `select a.*, b.* from web_user_email a 
            left join web_user b on a.user_email =  b.user_email  where a.user_email =:username `,
              {
                replacements: { username: username },
                type: sequelize.QueryTypes.SELECT,
              });

            res.json({
              accessToken: accessToken,
              username: username,
              roles: queryRoles
            });
          } catch (error) {
            console.log("error", error)
            res.status(401).json({ error: "có lỗi xảy ra" }); // This runs as well.
          }
        }
      });
    } else {
      res.json({ message: "Please Provide User And Password" });
    }
  }
}

module.exports = new Authenticate_Controller();
