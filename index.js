const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const model = require("./user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());
mongoose.set("strictQuery", false);
mongoose.connect(`${process.env.MONGO_URI}`, () => {
  console.log("Connected to MongoDB");
});

app.post("/api/register", async (req, res) => {
  const email = req.body.email;
  const required = await model.findOne({ email: email });
  if (required) {
    res.json({ status: "already registered" });
  } else {
    const newPassword = await bcrypt.hash(req.body.password, 10);
    try {
      const user = await model.create({
        name: req.body.name,
        email: req.body.email,
        password: newPassword,
      });

      res.json({ status: "ok" });
    } catch (err) {}
  }
});

app.post("/api/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await model.findOne({ email: email });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (isPasswordValid) {
    const token = await jwt.sign(
      { email: user.email, name: user.name },
      "secret123"
    );

    res.json({ status: "Login Successfull", token: token });
  } else {
    res.json({ status: "Wrong Email or Password" });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running");
});
app.listen("5000", () => console.log("Server started on port 5000"));
