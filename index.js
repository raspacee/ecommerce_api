require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

const userRouter = require("./routes/user.js");
const productRouter = require("./routes/product.js");
const adminRouter = require("./routes/admin.js");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

const errorLogStream = fs.createWriteStream(path.join(__dirname, "error.log"), {
  flags: "a",
});

// Log all errors to error.log
app.use(
  morgan("combined", {
    stream: errorLogStream,
    skip: function (req, res) {
      return res.statusCode < 400;
    },
  })
);
app.use(
  morgan("common", {
    stream: accessLogStream,
    skip: function (req, res) {
      return res.statusCode >= 400;
    },
  })
);
app.use(cors());
app.use(express.json());

app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/admin", adminRouter);

app.listen(PORT, () => {
  console.log("Application listening on port: " + PORT);
});
