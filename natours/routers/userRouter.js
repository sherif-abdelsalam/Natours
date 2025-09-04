const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();


router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);


// Protect all routes after this middleware
// because middleware are executed in order
// so you don't need to add authController.protect to each route
// it will be added automatically to all routes after this line 
router.use(authController.protect); 

router.patch("/updatePassword", authController.updatePassword);
router.get("/me", userController.getMe, userController.getUser);
router.patch("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);

// Restrict all routes after this middleware to admin only
router.use(authController.restrictTo("admin"));

router.route("/")
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route("/:id")
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(authController.protect, authController.restrictTo("admin"), userController.deleteUser);



module.exports = router