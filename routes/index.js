const router = require("express").Router();
const users = require("./users");
const config = require("../config/config");
const passport = require("passport");
const {
  login,
  logout,
  unauthorized,
} = require("../controllers/AuthController");
const { sequelize } = require("../db");
const util = require('../util');

router.get("/api", (req, res) => {
  return res.redirect("/api/status");
});

router.get("/api/status/:test?", async (req, res) => {
  const dbLocalTime = await sequelize.query("SELECT time('now','localtime');");
  const params = util.getAllParams(req);
  return res.status(200).json({
    message: "API is running on port: " + config.port,
    dbLocalTime: dbLocalTime[0][0]["time('now','localtime')"],
    params
  });
});

router.post(
  "/api/login",
  passport.authenticate("user-authentication", {
    failureRedirect: "/api/unauthorized",
    session: false,
  }),
  login
);
router.get("/api/unauthorized", unauthorized);
router.post("/api/logout/:id", logout);

// Secure all of the routes on the api/v1 path with authentication and session info
router.use(
  "/api/v1",
  passport.authenticate("user-authentication", {
    failureRedirect: "/api/unauthorized",
    session: false,
  })
);
router.use("/api/v1", (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      message: "Please login in order to access the application",
    });
  }
  return next();
});
router.use("/api/v1/users", users);

module.exports = router;
