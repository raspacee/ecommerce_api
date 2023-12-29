const jwt = require("jsonwebtoken");
const { CustomError } = require("../helpers/errorHandler.js");

exports.user_auth = (req, res, next) => {
  if (req.headers["authorization"]) {
    const token = req.headers["authorization"].split(" ")[1];
    jwt.verify(token, process.env.USER_JWT_SECRET, function (err, decoded) {
      if (err) {
        next(new CustomError(401, "Invalid JWT token"));
      }
      if (decoded) {
        req.user = decoded;
        next();
      } else {
        next(new CustomError(401, "Invalid JWT token"));
      }
    });
  } else {
    next(new CustomError(401, "authorization header missing"));
  }
};
