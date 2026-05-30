const Joi = require('joi');

const registerSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': 'Email cannot be blank',
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'Password cannot be blank',
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required'
    }),
    repeat_password: Joi.any().equal(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please repeat your password'
    }),
    role: Joi.string().valid('candidate', 'company').required(),
    full_name: Joi.string().when('role', { is: 'candidate', then: Joi.required().messages({'string.empty': 'Full name cannot be blank'}) }),
    company_name: Joi.string().when('role', { is: 'company', then: Joi.required().messages({'string.empty': 'Company name cannot be blank'}) }),
    industry_id: Joi.number().when('role', { is: 'company', then: Joi.required() }),
    accept_terms: Joi.boolean().valid(true).required().messages({
        'any.only': 'You must accept the terms and conditions'
    })
});

const validateRegister = (req, res, next) => {
    const { error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ 
            errors: error.details.map(err => err.message) 
        });
    }
    next();
};

module.exports = { validateRegister };