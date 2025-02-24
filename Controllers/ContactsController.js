const Services = require('../Services')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { UnFx, constants } = require('../Other/constants')
const ObjectId = require('mongoose').Types.ObjectId

module.exports = {
    getContactById: async(req) => {
        const { _id } = req.params
        const contact = await Services.ContactService.getById(_id)
        if(!contact){
            throw 'Contact Not Found!'
        }
        return { contact: contact }
    },
    createContact: async(req) => {
        const payload = req.payload
        if(payload.location.needAccommodation){
            let accommodationCount = (await Services.ContactService.aggregate([
                {
                    $match: {
                        'location.needAccommodation': true
                    }
                },
                {
                    $count: 'count'
                }
            ]))?.[0]?.count || 0
            if(accommodationCount >= constants.ACCOMMODATION_LIMIT){
                throw 'No space left for accommodation!'
            }
        }
        const contact = await Services.ContactService.create(payload)
        return { contact: contact }
    },
    updateContact: async(req) => {
        const { _id } = req.params
        const contact = await Services.ContactService.getById(_id)
        if(!contact){
            throw 'Contact not found!'
        }

        const payload = req.payload
        const updatedContact = await Services.ContactService.updateOne({ _id: new ObjectId(_id) }, payload)
        return { contact: updatedContact }
    }
}