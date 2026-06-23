const Joi = require('joi');

const onboardingSchema = Joi.object({
    display_name: Joi.string().trim().required().messages({
        'string.empty': 'Display Name cannot be blank',
        'any.required': 'Display Name is required'
    }),
    birthday: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required().messages({
        'string.empty': 'Date of Birth is required',
        'string.pattern.base': 'Date of Birth must be in YYYY-MM-DD format',
        'any.required': 'Date of Birth is required'
    }),
    phone: Joi.string().trim().allow('', null).optional(),
    avatar_url: Joi.string().trim().allow('', null).optional(),
    headline: Joi.string().trim().allow('', null).optional(),
    address: Joi.string().trim().allow('', null).optional(),
    education: Joi.array().items(
        Joi.object({
            school: Joi.string().trim().required().messages({
                'string.empty': 'School / Institute name cannot be blank',
                'any.required': 'School / Institute is required'
            }),
            degree: Joi.string().trim().required().messages({
                'string.empty': 'Degree / Field of Study cannot be blank',
                'any.required': 'Degree / Field of Study is required'
            }),
            startDate: Joi.string().regex(/^\d{4}-\d{2}$/).required().messages({
                'string.empty': 'Start Date is required',
                'string.pattern.base': 'Start Date must be in YYYY-MM format',
                'any.required': 'Start Date is required'
            }),
            gradDate: Joi.string().regex(/^\d{4}-\d{2}$/).allow('', null).optional().messages({
                'string.pattern.base': 'Graduation Date must be in YYYY-MM format'
            })
        })
    ).allow(null).optional(),
    experience: Joi.array().items(
        Joi.object({
            company: Joi.string().trim().required().messages({
                'string.empty': 'Company name cannot be blank',
                'any.required': 'Company name is required'
            }),
            role: Joi.string().trim().required().messages({
                'string.empty': 'Job Title / Role cannot be blank',
                'any.required': 'Job Title / Role is required'
            }),
            startDate: Joi.string().regex(/^\d{4}-\d{2}$/).required().messages({
                'string.empty': 'Start Date is required',
                'string.pattern.base': 'Start Date must be in YYYY-MM format',
                'any.required': 'Start Date is required'
            }),
            endDate: Joi.string().regex(/^\d{4}-\d{2}$/).allow('', null).optional().messages({
                'string.pattern.base': 'End Date must be in YYYY-MM format'
            })
        })
    ).allow(null).optional(),
    skills: Joi.array().items(
        Joi.object({
            name: Joi.string().trim().required().messages({
                'string.empty': 'Skill name cannot be blank',
                'any.required': 'Skill name is required'
            }),
            level: Joi.number().integer().min(0).max(100).required().messages({
                'number.base': 'Skill level must be a number',
                'number.min': 'Skill level must be at least 0',
                'number.max': 'Skill level cannot exceed 100',
                'any.required': 'Skill level is required'
            })
        })
    ).allow(null).optional(),
    followedCompanyIds: Joi.array().items(Joi.number().integer()).allow(null).optional()
});

const validateOnboarding = (req, res, next) => {
    const { error } = onboardingSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ 
            errors: error.details.map(err => err.message) 
        });
    }

    // Custom logic validations: start date <= current year, end date >= start date
    const currentYear = new Date().getFullYear();

    if (req.body.education && Array.isArray(req.body.education)) {
        for (let i = 0; i < req.body.education.length; i++) {
            const edu = req.body.education[i];
            const startYear = parseInt(edu.startDate.split('-')[0]);
            if (startYear > currentYear) {
                return res.status(400).json({
                    errors: [`Education #${i + 1}: Start year (${startYear}) cannot be in the future (must be <= ${currentYear})!`]
                });
            }
            if (edu.gradDate && edu.gradDate < edu.startDate) {
                return res.status(400).json({
                    errors: [`Education #${i + 1}: Graduation Date cannot be earlier than Start Date!`]
                });
            }
        }
    }

    if (req.body.experience && Array.isArray(req.body.experience)) {
        for (let i = 0; i < req.body.experience.length; i++) {
            const exp = req.body.experience[i];
            const startYear = parseInt(exp.startDate.split('-')[0]);
            if (startYear > currentYear) {
                return res.status(400).json({
                    errors: [`Experience #${i + 1}: Start year (${startYear}) cannot be in the future (must be <= ${currentYear})!`]
                });
            }
            if (exp.endDate && exp.endDate < exp.startDate) {
                return res.status(400).json({
                    errors: [`Experience #${i + 1}: End Date cannot be earlier than Start Date!`]
                });
            }
        }
    }

    next();
};

module.exports = { validateOnboarding };
