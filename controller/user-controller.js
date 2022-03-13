const res = require('express/lib/response');
const Users = require('../models/users.js');
const { uuid } = require('uuidv4');
const raw = require('body-parser/lib/types/raw');

async function getUsers(req,res) {
    const listUser = await Users.getAll();
    console.log(listUser);
    res.status(200).json(listUser);
}

async function login(req, res, next){
    const mobileNumber = req.body.mobileNumber;
    try {
        const user = await Users.findOne({
            where: {
                mobileNumber
            }
        })
        if(!user){
            const userUUID = uuid();
            await Users.create({mobileNumber, uuid: userUUID});
            res.status(201).json({userUUID});
        }else{
            res.status(200).json({userUUID: user.uuid}).end()
        }
    } catch (error) {
        next(error)   
    }
}

async function updateUser(req,res, next){
    const userUUID = req.params.uuid;
    try {
        const {nama, dob, city} = req.body;
        const user = await Users.findOne({
            where: {
                uuid: userUUID
            },
            raw: true
        })
        if(user){
            await Users.update({
                nama,
                dob,
                city
            },{
                where: {
                    uuid: user.uuid
                },
                logging: true
            });
            res.status(200).end();
        }else{
            res.status(400).end();
        }    
    } catch (error) {
        next(error);
    }
}


module.exports = {getUsers, login, updateUser};