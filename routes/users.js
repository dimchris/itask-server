var express = require('express');
var router = express.Router();
var userCtrl = require('../controllers/user')
var user_login = userCtrl.user_login
var user_signup = userCtrl.user_signup
var user_delete = userCtrl.user_delete
var user_get_all = userCtrl.user_get_all
var user_get = userCtrl.user_get
var user_update = userCtrl.user_update
var user_get_images = userCtrl.user_get_images
var user_add_image = userCtrl.user_add_image
var check_auth = require('../middleware/check-auth')
var check_admin = require('../middleware/check-admin')

//create user
router.post('/',user_signup)
//login
router.post('/login', user_login)

//user
router.get('/',check_auth,  check_admin, user_get_all)
router.get('/:userId', check_auth, user_get)
router.put('/:userId', check_auth, user_update)
router.delete('/:userId',check_auth, check_admin, user_delete)

//user images
router.get('/:userId/images', check_auth, user_get_images)
router.post('/:userId/images', check_auth, user_add_image)


module.exports = router;
