const Joi = require('joi')
const Services = require('../Services')

module.exports = [
    {
        method: 'POST',
        path: '/admin/login',
        handler: (req) => {

        },
        options: {
            description: 'Admin Login Via email and password',
            tags: ['api', 'admin', 'login'],
            validate: {
                payload: {
                    email: Joi.string().required(),
                    password: Joi.string().required()
                }
            }
        }
    }
]