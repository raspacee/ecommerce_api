const jwt = require("jsonwebtoken");
const { CustomError } = require("../helpers/errorHandler.js");

exports.admin_auth = (req, res, next) => {
  if (req.headers["authorization"]) {
    const token = req.headers["authorization"].split(" ")[1];
    jwt.verify(token, process.env.ADMIN_JWT_SECRET, function (err, decoded) {
      if (err) {
        next(new CustomError(401, "Invalid JWT token"));
      }
      if (decoded.admin_id) {
        next();
      } else {
        next(new CustomError(401, "Invalid JWT token"));
      }
    });
  } else {
    next(new CustomError(401, "authorization header missing"));
  }
};
