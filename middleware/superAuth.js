const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.admin.isSuperAdmin) {
      req.admin = decoded.admin;
      next();
    } else {
      return res.status(401).json({ msg: "This is for superAdmins only" });
    }
  } catch (e) {
    console.log(e);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
