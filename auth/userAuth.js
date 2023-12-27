const jwt = require("jsonwebtoken");

exports.user_auth = (req, res, next) => {
  if (req.headers["authorization"]) {
    const token = req.headers["authorization"].split(" ")[1];
    jwt.verify(token, process.env.USER_JWT_SECRET, function (err, decoded) {
      if (err) {
        return res.status(400).send({ error: "Invalid JWT token" });
      }
      if (decoded) {
        req.user = decoded;
        next();
      } else {
        return res.status(400).send({ error: "Invalid JWT token" });
      }
    });
  } else {
    return res.status(400).send({ error: "authorization header missing" });
  }
};
