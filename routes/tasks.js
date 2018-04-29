var express = require('express');
var router = express.Router();

var check_auth = require('../middleware/check-auth')
var check_admin = require('../middleware/check-admin')

var taskCtrl = require('../controllers/task')

var task_add = taskCtrl.task_add
var task_get = taskCtrl.task_get
var task_remove = taskCtrl.task_remove
var task_get_all = taskCtrl.task_get_all
var task_update = taskCtrl.task_update

router.post('/', check_auth, task_add)
router.get('/', task_get_all)
router.get('/:taskId', task_get)
router.put('/:taskId', check_auth, task_update)
router.delete('/:taskId', check_auth, task_remove)

module.exports = router;