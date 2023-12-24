require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

const userRouter = require("./routes/user.js");
const productRouter = require("./routes/product.js");
const adminRouter = require("./routes/admin.js");

app.use(cors());
app.use(express.json());

app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/admin", adminRouter);

app.listen(PORT, () => {
  console.log("Application listening on port: " + PORT);
});
