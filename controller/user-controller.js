const res = require('express/lib/response');
const Users = require('../models/users.js');
const Account = require('../models/account.js');
const Redis = require('../config/redis');
const { uuid } = require('uuidv4');
const raw = require('body-parser/lib/types/raw');
var jwt = require('jsonwebtoken');
const { request } = require('chai');
const createLogger = require('../utils/logger');
const userQueue = require('../service/user-service');
const logger = createLogger('user-service');


async function generateToken(data){
    const token = await jwt.sign(data, process.env.JWT_SECRET);
    await Redis.set(`user-session/${data.uuid}`, JSON.stringify({ token, ...data }), 'EX', 60*60*60 );
    return token;
}

async function generateOtp(uuid){
    const newData = {
        otp: '',
        challangeCode: '',
        mobileNumber: '',
    }
    await Redis.set(`user-session/${uuid}/otp`, JSON.stringify(newData), 'EX', 60*60*60 );
    return newData;
}

async function verifyJwt(req,res,next){
    const header =req.headers.authorization;
    if(header && header.startsWith('Bearer ')){
        // tokens
        const token = header.slice(7, header.length);
        const secret = process.env.JWT_SECRET;
        try {
            const decodedToken = await jwt.verify(token, secret);
            const [[errSession, foundSession], [errExpire]]  = await Redis.pipeline()
              .get(`user-session/${decodedToken.uuid}`)
              .expire(`user-session/${decodedToken.uuid}`,  60*60*60)
              .exec();
            if (errExpire) {
              throw errExpire;
            }
            if (errSession) {
              throw errSession;
            }
            if (foundSession && JSON.parse(foundSession).token === token) {
                next();
            }else{
                throw new Error('Session not found');
            }
        } catch (error) {
            if(error) logger.error(error.message);
            res.status(400).json({message : `Authentication failed! ${error.message}`}).end();
        }
    }else{
        res.status(400).json({message : 'Missing Authentication Token'}).end();
    }
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
        if(!user){
            const userUUID = uuid();
            await Users.create({mobileNumber, uuid: userUUID});
            const result = await generateOtp({userUUID});
            res.status(201).json({otp: result.otp , challangeCode: result.challangeCode});
        }else{
            token = await generateToken({uuid: user.uuid});
            res.status(200).json({token});
        }
    } catch (error) {
        next(error)   
    }
}

async function verifyOtp(req, res, next){
    const {otp, challangeCode, mobileNumber} = req.body;
    try {
        const user = await Users.findOne({
            where: {
                mobileNumber
            }
        })
        if(user && otp){
            token = await generateToken({uuid: userUUID});
            res.status(201).json({token});
        }
    } catch (error) {
        next(error)   
    }
}



async function updateUser(req,res, next){
    const userUUID = req.params.uuid;
    try {
        const {nama, dob, city, sourceOfFund, puposeAccount, occupation, avgMonthlyIncome} = req.body;

        // const {error, value} = await schemaUserUpdate.validateAsync({ nama, dob, city});
        // if (error) throw error;
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
            // next({userId: user.id});
            userQueue.add({userId: user.id, sourceOfFund, puposeAccount, occupation, avgMonthlyIncome });
            res.status(200).end();
        }else{
            res.status(400).end();
        }    
    } catch (error) {
        next(error);
        console.log(error);
        // res.status(400).json(error).end()
    }
}

async function updateAccount(user,req,res,next){
    try {
        const {sourceOfFund, puposeAccount, occupation, avgMonthlyIncome} = req.body;
        if(user){
            const {userId} = user;
            await Account.create({
                userId,
                sourceOfFund,
                puposeAccount,
                occupation,
                avgMonthlyIncome
            })
            res.status(200).end();
        }else{
            res.status(400).json({message : 'Not found'}).end();
        }
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


module.exports = {verifyJwt, getUsers, login, updateUser, deleteUser, updateAccount};