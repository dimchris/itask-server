var express = require('express');
var router = express.Router();

var check_auth = require('../middleware/check-auth')
var check_admin = require('../middleware/check-admin')

var cardCtrl = require('../controllers/card')

var card_add = cardCtrl.card_add
var card_get = cardCtrl.card_get
var card_remove = cardCtrl.card_remove
var card_get_all = cardCtrl.card_get_all
var card_update = cardCtrl.card_update

router.post('/', check_auth, card_add)
router.get('/',  card_get_all)
router.get('/:cardId', card_get)
router.put('/:cardId', check_auth, card_update)
router.delete('/:cardId', check_auth, card_remove)

module.exports = router;