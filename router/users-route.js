const express = require('express');
const users = require('../controller/user-controller');

const router = express.Router();


router.get('/all', users.getUsers);
router.post('/login', users.login);
// router.put('/:uuid', users.verifyJwt, users.updateUser, users.updateAccount);
router.put('/:uuid', users.verifyJwt, users.updateUser);
// router.put('/:uuid/pin', users.setPin);
// for admin
router.delete('/:uuid', users.deleteUser);

module.exports = router;
