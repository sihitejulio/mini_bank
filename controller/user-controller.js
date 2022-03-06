const res = require('express/lib/response');
const Users = require('../models/users.js');

async function getUsers(req,res) {
    const listUser = await Users.getAll();
    console.log(listUser);
    res.status(200).json(listUser);
}


module.exports = {getUsers};