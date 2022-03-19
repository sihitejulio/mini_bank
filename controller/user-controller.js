const res = require('express/lib/response');
const Users = require('../models/users.js');
const Account = require('../models/account.js');
const Redis = require('../config/redis');
const { uuid } = require('uuidv4');
const raw = require('body-parser/lib/types/raw');
var jwt = require('jsonwebtoken');

async function generateToken(data){
    const token = await jwt.sign(data, process.env.JWT_SECRET);
    await Redis.set(`user-sessionj/${data.uuid}`, JSON.stringify({ token, ...data }), 'EX', 60 * 60 );
    return token;
}

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
        let token = null;
        console.log(user);
        if(!user){
            const userUUID = uuid();
            await Users.create({mobileNumber, uuid: userUUID});
            token = await generateToken({uuid: userUUID});
            res.status(201).json(token);
        }else{
            token = await generateToken({uuid: user.uuid});
            res.status(200).json(token).end()
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
            next({userId: user.id});
        }else{
            res.status(400).end();
        }    
    } catch (error) {
        next(error);
    }
}

async function updateAccount(user,req,res,next){
    try {
        const {sourceOfFund, puposeAccount, occupation, avgMonthlyIncome} = req.body;
        const {userId} = user;
        await Account.create({
            userId,
            sourceOfFund,
            puposeAccount,
            occupation,
            avgMonthlyIncome
        })
        res.status(200).end();
    } catch (error) {
        next(error);
    }
}


async function deleteUser(req, res) {
   const userUUID = await req.params.uuid;
   try {

        const user = await Users.findOne({
            where: {
                uuid: userUUID
            }
        })

        if(user){
            await user.destroy({
                where: {
                    uuid: user.uuid
                }
            })
            res.status(200).end();
        }
        res.status(400).end();    
   } catch (error) {
       next(error);
   }
}


module.exports = {getUsers, login, updateUser, deleteUser, updateAccount};