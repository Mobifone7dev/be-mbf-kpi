require("dotenv").config();
const jwt = require("jsonwebtoken");
const ldap = require("ldapjs");

class Authenticate_Controller {
  async index(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const user = { name: username };
    if (username && password) {
      var client = ldap.createClient({
        url: process.env.LDAP_URI,
        timeout: 5000,
        connectTimeout: 10000,
      });
      client.bind(username, password, (err) => {
        client.unbind();
        if (err) {
          console.log(err);
          res.sendStatus(401);
        } else {
          const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "10d",
          });
          res.json({
            accessToken: accessToken,
            username: username,
          });
        }
      });
    } else {
      res.json({ message: "Please Provide User And Password" });
    }
  }
}

module.exports = new Authenticate_Controller();
