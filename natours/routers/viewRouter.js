const {Router} = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');


const router = Router();

router.use(authController.isLoggedIn); // to make the user available in all pug templates

router.get('/', viewController.getOverview);
router.get('/tour/:slug',viewController.getTour);
router.get('/login', viewController.getLoginForm);
// router.get('/me', viewController.getAccount);
// router.post('/submit-user-data', viewController.updateUserData);

module.exports = router;