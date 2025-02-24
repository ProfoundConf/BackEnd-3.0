const Joi = require('joi')
const Services = require('../Services')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const ContactsController = require('../Controllers/ContactsController')
const { UnFx } = require('../Other/constants')

const contactValidation = Joi.object({
    fullName: Joi.string().required(),
    age: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    city: Joi.string().required(),
    church: Joi.string().required(),
    eatDays: Joi.object({
        Fr: Joi.boolean(),
        Sa: Joi.boolean()
    }).required(),
    location: Joi.string().optional(),
    arrived: Joi.boolean(),
    paid: Joi.boolean()
})

const contactOptionalValidation = Joi.object({
    fullName: Joi.string().optional(),
    age: Joi.string().optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    city: Joi.string().optional(),
    church: Joi.string().optional(),
    eatDays: Joi.object({
        Fr: Joi.boolean(),
        Sa: Joi.boolean()
    }).optional(),
    location: Joi.string().optional(),
    arrived: Joi.boolean(),
    paid: Joi.boolean()
})

module.exports = [
    {
        method: 'GET',
        path: '/contacts/{_id}',
        handler: async(req, h) => ContactsController.getContactById(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Get Contact By Id',
            tags: ['api', 'contacts', 'get'],
            validate: {
                params: Joi.object({
                    _id: Joi.string().required()
                }),
                failAction: UnFx.failAction
            }
        }
    },
    {
        method: 'POST',
        path: '/contacts',
        handler: async(req, h) => ContactsController.createContact(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Create New Contact',
            tags: ['api', 'contacts', 'create'],
            validate: {
                payload: contactValidation,
                failAction: UnFx.failAction
            }
        }
    },
    {
        method: 'PATCH',
        path: '/contacts/{_id}',
        handler: async(req, h) => ContactsController.updateContact(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Updates Some Contact',
            tags: ['api', 'contacts', 'update'],
            validate: {
                params: Joi.object({
                    _id: Joi.string().required()
                }),
                payload: contactOptionalValidation,
                failAction: UnFx.failAction
            }
        }
    },
]