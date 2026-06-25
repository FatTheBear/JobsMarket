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
    accept_terms: Joi.boolean().valid(true).required().messages({
        'any.only': 'You must accept the terms and conditions'
    })
});

const validateRegister = (req, res, next) => {
    const { error } = registerSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
        const errorMessages = error.details.map(err => err.message);
        return res.status(400).json({ errors: errorMessages });
    }
    
    next();
};

const companyRegisterSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': 'Email cannot be blank',
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/).required().messages({
        'string.empty': 'Password cannot be blank',
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
    }),
    hrName: Joi.string().pattern(/^[\p{L}\s]+$/u).min(2).max(100).required().messages({
        'string.empty': 'HR Name cannot be blank',
        'string.pattern.base': 'HR Name can only contain letters and spaces',
        'string.min': 'HR Name must be at least 2 characters',
        'string.max': 'HR Name cannot exceed 100 characters',
        'any.required': 'HR Name is required'
    }),
    hrPhone: Joi.string().pattern(/^\+?[0-9]{8,15}$/).required().messages({
        'string.empty': 'HR Phone cannot be blank',
        'string.pattern.base': 'HR Phone must be a valid number (8-15 digits, optional + at the beginning)',
        'any.required': 'HR Phone is required'
    }),
    companyName: Joi.string().pattern(/^[\p{L}0-9\s.&-]+$/u).min(2).max(150).required().messages({
        'string.empty': 'Company Name cannot be blank',
        'string.pattern.base': 'Company Name cannot contain special characters (only letters, numbers, spaces, ., &, -)',
        'any.required': 'Company Name is required'
    }),
    companyPhone: Joi.string().pattern(/^\+?[0-9]{8,15}$/).required().messages({
        'string.empty': 'Company Phone cannot be blank',
        'string.pattern.base': 'Company Phone must be a valid number (8-15 digits, optional + at the beginning)',
        'any.required': 'Company Phone is required'
    }),
    location: Joi.string().min(5).max(255).required().messages({
        'string.empty': 'Location cannot be blank',
        'string.min': 'Location must be at least 5 characters',
        'any.required': 'Location is required'
    }),
    taxId: Joi.string().pattern(/^\d{10}(-\d{3})?$/).required().messages({
        'string.empty': 'Tax ID cannot be blank',
        'string.pattern.base': 'Tax ID must follow the standard format (10 digits, or 10 digits followed by - and 3 digits)',
        'any.required': 'Tax ID is required'
    }),
    industryId: Joi.number().integer().positive().required().messages({
        'number.base': 'Industry must be selected',
        'any.required': 'Industry is required'
    }),
    size: Joi.string().valid('1-50', '51-200', '201-1000', '1000+').required().messages({
        'string.empty': 'Company size cannot be blank',
        'any.only': 'Invalid company size selected',
        'any.required': 'Company size is required'
    }),
    description: Joi.string().min(50).max(5000).required().messages({
        'string.empty': 'Description cannot be blank',
        'string.min': 'Description must be at least 50 characters to provide sufficient detail',
        'string.max': 'Description cannot exceed 5000 characters',
        'any.required': 'Description is required'
    }),
    role: Joi.string().valid('company').required()
}).unknown(true);


const validateCompanyRegister = (req, res, next) => {
    const { error } = companyRegisterSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
        const errorMessages = error.details.map(err => err.message);
        return res.status(400).json({ errors: errorMessages });
    }
    
    next();
};

module.exports = {
    validateRegister,
    validateCompanyRegister
};