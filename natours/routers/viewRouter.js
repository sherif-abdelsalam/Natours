const { Router } = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = Router();

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.isLoggedIn, viewController.getAccount);
// router.post('/submit-user-data', viewController.updateUserData);

module.exports = router;
