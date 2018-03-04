var express = require('express');
var router = express.Router();
var userCtrl = require('../controllers/user')
var user_login = userCtrl.user_login
var user_signup = userCtrl.user_signup
var user_delete = userCtrl.user_delete
var check_auth = require('../middleware/check-auth')

router.post('/signup',user_signup)
router.post('/login', user_login)
router.delete('/:userId',check_auth, user_delete)


module.exports = router;
