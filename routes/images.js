var express = require('express');
var router = express.Router();

var check_auth = require('../middleware/check-auth')
var check_admin = require('../middleware/check-admin')

var imageCtrl = require('../controllers/image')

var image_add = imageCtrl.image_add
var image_get = imageCtrl.image_get
var image_delete = imageCtrl.image_delete
var image_get_all = imageCtrl.image_get_all

router.post('/', check_auth, image_add)
router.get('/',  image_get_all)
router.get('/:imageId', image_get)

module.exports = router;