require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
  origin: "http://localhost:3000",
};
app.use(cors(corsOptions));

app.use(express.json());
const adminRouter = require("./routes/admins");
const problemRouter = require("./routes/problems");
app.use("/admin", adminRouter);
app.use("/problem", problemRouter);

module.exports = app;
