const express = require('express');
const users = require('../controller/user-controller');
const router = express.Router();

router.get('/all', users.getUsers);
router.post('/', users.login);
router.put('/:uuid', users.updateUser);
router.put('/:uuid/pin', users.setPin);



module.exports = router;
