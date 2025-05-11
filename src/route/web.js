const express = require("express");
import loginAdmin from "../controllers/Login/login.admin.controller";
const router = express.Router();

let initWebRoutes = (app) => {
  router.post("/api/login-admin", loginAdmin.loginAccAdmin);

  app.use("/", router);
};

module.exports = initWebRoutes;
