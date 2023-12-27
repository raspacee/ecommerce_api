const jwt = require("jsonwebtoken");

exports.admin_auth = (req, res, next) => {
  if (req.headers["authorization"]) {
    const token = req.headers["authorization"].split(" ")[1];
    jwt.verify(token, process.env.ADMIN_JWT_SECRET, function (err, decoded) {
      if (err) {
        return res.status(400).send({ error: "Invalid JWT token" });
      }
      if (decoded.admin_id) {
        next();
      } else {
        return res.status(400).send({ error: "Invalid JWT token" });
      }
    });
  } else {
    return res.status(400).send({ error: "authorization header missing" });
  }
};
