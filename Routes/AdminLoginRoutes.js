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
    },
    {
        method: 'POST',
        path: '/admin/create',
        handler: async(req, h) => AdminLoginController.createAdmin(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Create new Admin account',
            tags: ['api', 'admin', 'create'],
            validate: {
                payload: Joi.object({
                    email: Joi.string().required(),
                    password: Joi.string().required(),
                    secret: Joi.string().required()
                }).required(),
                failAction: UnFx.failAction
            }
        }
    },
    {
        method: 'POST',
        path: '/admin/loginViaAccessToken',
        handler: async(req, h) => AdminLoginController.loginAdminViaAccessToken(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Admin Login Via Access Token',
            tags: ['api', 'admin', 'login'],
            validate: {
                payload: Joi.object({
                    accessToken: Joi.string().required(),
                }).required(),
                failAction: UnFx.failAction
            }
        }
    },
    {
        method: 'POST',
        path: '/admin/logout',
        handler: async(req, h) => AdminLoginController.logoutAdmin(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Admin Logout',
            tags: ['api', 'admin', 'logout'],
            auth: 'jwt'
        }
    },
]