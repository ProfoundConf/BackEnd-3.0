const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi);
const Services = require('../Services')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const ContactsController = require('../Controllers/ContactsController')
const { UnFx } = require('../Other/constants')

const contactValidation = Joi.object({
    fullName: Joi.string().required(),
    age: Joi.string().required(),
    phone: Joi.string().required(),
    needAccommodation: Joi.boolean().optional(),
    email: Joi.string().email().required(),
    city: Joi.string().required(),
    church: Joi.string().required(),
    eatDays: Joi.object({
        Fr: Joi.boolean(),
        Sa: Joi.boolean()
    }).required(),
    location: Joi.objectId().optional(),
    arrived: Joi.boolean().optional(),
    paid: Joi.boolean().optional()
})

const contactOptionalValidation = Joi.object({
    fullName: Joi.string().optional(),
    age: Joi.string().optional(),
    phone: Joi.string().optional(),
    needAccommodation: Joi.boolean().optional(),
    email: Joi.string().email().optional(),
    city: Joi.string().optional(),
    church: Joi.string().optional(),
    eatDays: Joi.object({
        Fr: Joi.boolean(),
        Sa: Joi.boolean()
    }).optional(),
    location: Joi.objectId().optional(),
    arrived: Joi.boolean().optional(),
    paid: Joi.boolean().optional()
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
                    populate: Joi.array().items(Joi.string().trim().valid('location')).optional()
                }).optional(),
                failAction: UnFx.failAction
            },
            auth: 'jwt'
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
]