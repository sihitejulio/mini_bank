
const Queue = require('bull');
const userQueue = new Queue('user proccess', 'redis://127.0.0.1:6379');
const Account = require('../models/account.js');

// const audioQueue = new Queue('audio transcoding', { redis: { port: 6379, host: '127.0.0.1'} }); // Specify Redis connection using object
// const imageQueue = new Queue('image transcoding');
// const pdfQueue = new Queue('pdf transcoding');

userQueue.process(async function (job, done) {

  // job.data contains the custom data passed when the job was created
  // job.id contains id of this job.

  // transcode video asynchronously and report progress
    job.progress(42);
 
    const {userId, sourceOfFund, puposeAccount, occupation, avgMonthlyIncome} = job.data;
    const account = await Account.findOne({where: {
        userId,
    }});
    if(account){
        await account.update({
            sourceOfFund,
            puposeAccount,
            occupation,
            avgMonthlyIncome  
        })
    }else{
        await Account.create({
            userId,
            sourceOfFund,
            puposeAccount,
            occupation,
            avgMonthlyIncome
        })
    }
   
//   call done when finished
  done();

  // or give a error if error
  done(new Error('error transcoding'));

  // or pass it a result
  done(null, { framerate: 29.5 /* etc... */ });

  // If the job throws an unhandled exception it is also handled correctly
  throw new Error('some unexpected error');
});

module.exports = userQueue;
