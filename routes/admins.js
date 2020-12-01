const express = require("express");
const router = express.Router();
const Admin = require("../models/admin");
const auth = require("../middleware/auth");
const superAuth = require("../middleware/superAuth");
const bcrypt = require("bcryptjs");
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  const { name, password } = req.body;

  try {
    let admin = await Admin.findOne({ name });
    if (!admin) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const payload = {
      admin: {
        id: admin.id,
        isSuperAdmin: admin.isSuperAdmin,
      },
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
      if (err) {
        throw err;
      } else {
        res.status(200).json({ token, isSuperAdmin: admin.isSuperAdmin });
      }
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).send({ msg: "Server error" });
  }
});

//encrypt the new password and set it
//return if it was succesful or not.
//this is for chaning your own password
//there should be one patch /:id that superAdmin can use to change others.
router.patch("/", auth, async (req, res) => {
  try {
    let admin = await Admin.findOne({ _id: req.admin.id });
    if (!admin) {
      return res.status(400).json({ msg: "Admin do not exists" });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(req.body.password, salt);

    await admin.save();
    return res.status(200).json({ msg: "Password changed" });
  } catch (e) {
    console.log("error ", e.message);
    return res.status(500).json({ msg: "Server error" });
  }
});

router.patch("/:id", superAuth, async (req, res) => {
  try {
    let admin = await Admin.findOne({ _id: req.params.id });
    if (!admin) {
      return res.status(400).json({ msg: "Admin do not exists" });
    }

    admin.isSuperAdmin = !admin.isSuperAdmin;

    await admin.save();
    return res.status(200).json({
      msg: "Is super admin toggled",
      isSuperAdmin: admin.isSuperAdmin,
    });
  } catch (e) {
    console.log("error ", e.message);
    return res.status(500).json({ msg: "Server error" });
  }
});

router.get("/", superAuth, async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    return res.json(admins);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

//should have superAuth later on so only superadmin can do it.
router.post("/", superAuth, async (req, res) => {
  const { name, password, isSuperAdmin } = req.body;
  try {
    let admin = await Admin.findOne({ name });
    if (admin) {
      return res.status(400).json({ msg: "Admin already exists" });
    }

    admin = new Admin({
      name,
      password,
      isSuperAdmin,
    });

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);

    await admin.save();
    return res.status(200).json({ msg: "Admin created", id: admin._id });
  } catch (e) {
    res.status(500).send({ msg: "Server error" });
  }
});

router.delete("/:id", superAuth, async (req, res) => {
  //you shouldn't be able to delete yourself?
  try {
    await Admin.deleteOne({ _id: req.params.id });
    return res.status(200).json({ msg: "Admin deleted" });
  } catch (e) {
    return res.status(404).json({ msg: "Admin not deleted" });
  }
});

module.exports = router;
