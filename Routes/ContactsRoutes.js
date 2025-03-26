const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi);
const Services = require('../Services')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const ContactsController = require('../Controllers/ContactsController')
const { UnFx } = require('../Other/constants')

const contactValidation = Joi.object({
    fullName: Joi.string().required(),
    age: Joi.number().required(),
    phone: Joi.string().required(),
    needAccommodation: Joi.boolean().optional(),
    email: Joi.string().email().optional(),
    city: Joi.string().required(),
    church: Joi.string().required(),
    sex: Joi.string().valid('M','F').required(),
    eatDays: Joi.object({
        Fr: Joi.boolean(),
        Sa: Joi.boolean()
    }).required(),
    location: Joi.objectId().optional(),
    services: Joi.array().items(Joi.string()).optional(),
    arrived: Joi.boolean().optional(),
    paid: Joi.boolean().optional(),
    chatId: Joi.number().optional(),
    promoCode: Joi.string().optional()
})

const contactOptionalValidation = Joi.object({
    fullName: Joi.string().optional().allow('', null),
    age: Joi.number().optional().allow(null),
    phone: Joi.string().optional().allow('', null),
    needAccommodation: Joi.boolean().optional(),
    email: Joi.string().email().optional().allow('', null),
    city: Joi.string().optional().allow('', null),
    church: Joi.string().optional().allow('', null),
    sex: Joi.string().valid('M','F').optional().allow('', null),
    eatDays: Joi.object({
        Fr: Joi.boolean(),
        Sa: Joi.boolean()
    }).optional().allow(null),
    location: Joi.objectId().optional().allow(null),
    services: Joi.array().items(Joi.string()).optional(),
    arrived: Joi.boolean().optional(),
    paid: Joi.boolean().optional(),
    chatId: Joi.number().optional().allow('', null),
    promoCode: Joi.string().optional().allow('', null)
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
                    _id: Joi.objectId().required()
                }),
                query: Joi.object({
                    populate: Joi.array().items(Joi.string().trim().valid('location','sendQr','allCount')).optional(),
                }).optional(),
                failAction: UnFx.failAction
            },
        }
    },
    {
        method: 'GET',
        path: '/contacts/for-living',
        handler: async(req, h) => ContactsController.getContactsForLiving(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Get Contact who need accommodation',
            tags: ['api', 'contacts', 'get', 'accommodation'],
            auth: 'jwt'
        }
    },
    {
        method: 'GET',
        path: '/contacts/for-living-count',
        handler: async(req, h) => ContactsController.getContactsForLivingCount(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Get Contact who need accommodation count',
            tags: ['api', 'contacts', 'get', 'accommodation'],
        }
    },
    {
        method: 'GET',
        path: '/contacts/churches-by-city',
        handler: async(req, h) => ContactsController.getChurchesByCity(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Get Churches By City',
            tags: ['api', 'contacts', 'get', 'churches'],
            validate: {
                query: Joi.object({
                    city: Joi.string().trim().required()
                }),
                failAction: UnFx.failAction
            },
            auth: 'jwt'
        }
    },
    {
        method: 'GET',
        path: '/contacts',
        handler: async(req, h) => ContactsController.getContacts(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Get Contacts',
            tags: ['api', 'contacts', 'get'],
            validate: {
                query: Joi.object({
                    name: Joi.string().trim().optional(), // Regex will be applied in MongoDB
                    email: Joi.string().trim().optional(), // Ensuring valid email format
                    phone: Joi.string().trim().optional(), // Assuming phone number as string
                    city: Joi.string().trim().optional(),
                    church: Joi.string().trim().optional(),
                    eatDays: Joi.array().items(Joi.string().valid('Fr', 'Sa')).optional(), // Only 'Fr' or 'Sa' allowed
                    sex: Joi.string().valid('M','F').optional(),
                    arrived: Joi.boolean().optional(), // Explicitly checking for boolean value
                    needAccommodation: Joi.boolean().optional(),
                    populate: Joi.array().items(Joi.string().trim().valid('location')).optional(),
                }).optional(),
                failAction: UnFx.failAction
            },
            auth: 'jwt'
        }
    },
    {
        method: 'GET',
        path: '/contacts/check-registration',
        handler: async(req, h) => ContactsController.checkRegistration(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Check If Contact Was Registered Before By Phone Number',
            tags: ['api', 'contacts', 'get', 'phone'],
            validate: {
                query: Joi.object({
                    phone: Joi.string().trim().required()
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
                    _id: Joi.objectId().required()
                }),
                payload: contactOptionalValidation,
                failAction: UnFx.failAction
            },
            auth: 'jwt'
        }
    },
    {
        method: 'DELETE',
        path: '/contacts/{_id}',
        handler: async(req, h) => ContactsController.deleteContact(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Delete Some Contact',
            tags: ['api', 'contacts', 'delete'],
            validate: {
                params: Joi.object({
                    _id: Joi.objectId().required()
                }).required(),
                failAction: UnFx.failAction
            },
            auth: 'jwt'
        }
    },
    {
        method: 'POST',
        path: '/contacts/paid/{_id}',
        handler: async(req, h) => ContactsController.payContact(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'payContact',
            tags: ['api', 'contacts', 'create'],
        }
    },
]