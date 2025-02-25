const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi);
const Services = require('../Services')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const AddressController = require('../Controllers/AddressController.js')
const { UnFx } = require('../Other/constants')

const addressValidation = Joi.object({
    address: Joi.string().required(),
    phone: Joi.string().required(),
    maxCount: Joi.number().required(),
    color: Joi.string().optional(),
});

const addressOptionalValidation = Joi.object({
    address: Joi.string().optional(),
    phone: Joi.string().optional(),
    color: Joi.string().optional(),
    maxCount: Joi.number().optional(),
});

module.exports = [
    {
        method: 'GET',
        path: '/address/{_id}',
        handler: async(req, h) => AddressController.getAddressById(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Get Address By Id',
            tags: ['api', 'address', 'get'],
            validate: {
                params: Joi.object({
                    _id: Joi.objectId().required()
                }),
                query: Joi.object({
                    populate: Joi.array().items(Joi.string().trim().valid('contacts')).optional()
                }).optional(),
                failAction: UnFx.failAction
            },
            auth: 'jwt'
        }
    },
    {
        method: 'GET',
        path: '/address',
        handler: async(req, h) => AddressController.getAddress(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Get Addresses',
            tags: ['api', 'address', 'get'],
            validate: {
                query: Joi.object({
                    address: Joi.string().optional(),
                    phone: Joi.string().optional(),
                    maxCount: Joi.number().optional(),
                    populate: Joi.array().items(Joi.string().trim().valid('contacts')).optional()
                }).optional(),
                failAction: UnFx.failAction
            },
            auth: 'jwt'
        }
    },
    {
        method: 'POST',
        path: '/address',
        handler: async(req, h) => AddressController.createAddress(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Create New Address',
            tags: ['api', 'address', 'create'],
            validate: {
                payload: addressValidation,
                failAction: UnFx.failAction
            },
            auth: 'jwt'
        }
    },
    {
        method: 'PATCH',
        path: '/address/{_id}',
        handler: async(req, h) => AddressController.updateAddress(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Updates Some Address',
            tags: ['api', 'address', 'update'],
            validate: {
                params: Joi.object({
                    _id: Joi.objectId().required()
                }),
                payload: addressOptionalValidation,
                failAction: UnFx.failAction
            },
            auth: 'jwt'
        }
    },
    {
        method: 'DELETE',
        path: '/address/{_id}',
        handler: async(req, h) => AddressController.deleteAddress(req)
        .then(res => UnFx.sendSuccess(res, h))
        .catch(err => UnFx.sendError(err, h)),
        options: {
            description: 'Delete Address By Id',
            tags: ['api', 'address', 'delete'],
            validate: {
                params: Joi.object({
                    _id: Joi.objectId().required()
                }),
                failAction: UnFx.failAction
            },
            auth: 'jwt'
        }
    }
]