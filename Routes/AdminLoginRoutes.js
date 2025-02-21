const Joi = require('joi')
const Services = require('../Services')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const AdminLoginController = require('../Controllers/AdminLoginController')
const { UnFx } = require('../Other/constants')

module.exports = [
    {
        method: 'POST',
        path: '/admin/login',
        handler: async(req, h) => AdminLoginController.loginAdmin(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Admin Login Via email and password',
            tags: ['api', 'admin', 'login'],
            validate: {
                payload: Joi.object({
                    email: Joi.string().required(),
                    password: Joi.string().required()
                }).required(),
                failAction: UnFx.failAction
            }
        }
    }
]