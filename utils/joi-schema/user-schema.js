const Joi = require('joi');
const validator = require('express-joi-validation').createValidator({
    passError: true
});

//user update
const schemaUserUpdateBody = Joi.object({
    nama: Joi.string()
        .min(3)
        .max(130)
        .required(),
    dob: Joi.string().required(),
        // .pattern(new RegExp('^\d{4}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$')),
    city: Joi.string()
          .required()
})

module.exports = {schemaUserUpdate}