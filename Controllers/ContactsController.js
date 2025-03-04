const Services = require('../Services')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { UnFx, constants } = require('../Other/constants')
const ObjectId = require('mongoose').Types.ObjectId

const freeAddresses = [
    {
        $lookup: {
            from: "contacts",
            localField: "_id",
            foreignField: "location",
            as: "linkedContacts"
        }
    },
    {
        $addFields: {
            usedSpots: { $size: "$linkedContacts" },
            freeSpots: { $subtract: ["$maxCount", { $size: "$linkedContacts" }] }
        }
    },
    {
        $match: { freeSpots: { $gt: 0 } }
    },
    {
        $group: {
            _id: null,
            totalFreeSpots: { $sum: "$freeSpots" }
        }
    }
]

const contactsNeedAccommodationCriteria = [
    {
        $match: {
            'needAccommodation': true,
            'location': {
                $exists: false
            }
        }
    },
    {
        $count: 'count'
    }
]

module.exports = {
    getContactById: async(req) => {
        const { _id } = req.params
        const populate = req.query?.populate || []
        const contact = await Services.ContactService.getById(_id)
        if(!contact){
            throw {
                statusCode: 404,
                message: 'Contact not found!'
            }
        }

        if(populate.includes('location')){
            contact._location = await Services.AddressService.getById(contact.location)
        }

        return { contact: contact }
    },
    getContactsForLiving: async(req) => {
        try{
            const groupCriteria = [
                {
                    $match: {
                        'needAccommodation': true,
                        'location': {
                            $exists: false
                        }
                    }
                },
                {
                    $group: {
                      _id: { city: "$city", church: "$church" }, // Group by city & church
                      contacts: { $push: "$$ROOT" } // Push full contact details
                    }
                  },
                  {
                    $group: {
                      _id: "$_id.city", // Group by city
                      churches: { $push: { k: "$_id.church", v: "$contacts" } } // Store church groups as key-value pairs
                    }
                  },
                  {
                    $project: {
                      _id: 0,
                      city: "$_id",
                      churches: { $arrayToObject: "$churches" } // Convert array to object
                    }
                  },
                  {
                    $group: {
                      _id: null,
                      result: { $push: { k: "$city", v: "$churches" } } // Convert final city array to object
                    }
                  },
                  {
                    $project: {
                      _id: 0,
                      result: { $arrayToObject: "$result" } // Convert array to object
                    }
                  }
            ]
            const contacts = (await Services.ContactService.aggregate(groupCriteria))?.[0]?.result

            return { contacts: contacts }
        }catch(err){
            throw err
        }
    },
    getChurchesByCity: async(req) => {
        try{
            const { city } = req.query

            const contacts = await Services.ContactService.get({ city: { $regex: city, $options: 'i' } }, { church: 1 })
            const churches = contacts.map(contact => contact.church)
            return { city: city, churches: churches }
        } catch(err) {
            console.log(err)
            throw err
        }
    },
    getContacts: async(req) => {
        try{
            const query = { ...req.query } || {}
            const populate = req?.query?.populate || []

            const criteriaAll = []
    
            if (query.name) criteriaAll.push({ $match: { fullName: { $regex: query.name, $options: 'i' } } });

            if (query.email) criteriaAll.push({ $match: { email: { $regex: query.email, $options: 'i' } } });

            if (query.phone) criteriaAll.push({ $match: { phone: { $regex: query.phone, $options: 'i' } } });

            if (query.city) criteriaAll.push({ $match: { city: { $regex: query.city, $options: 'i' } } });

            if (query.church) criteriaAll.push({ $match: { church: { $regex: query.church, $options: 'i' } } });
            
            if (query.eatDays) {
                if (query.eatDays.includes('Fr')) criteriaAll.push({ $match: { 'eatDays.Fr': true } });
                if (query.eatDays.includes('Sa')) criteriaAll.push({ $match: { 'eatDays.Sa': true } });
            }
            
            if (query.hasOwnProperty('arrived')) criteriaAll.push({ $match: { arrived: query.arrived } });

            if(query.hasOwnProperty('needAccommodation')){
                if(query.needAccommodation){
                    criteriaAll.push({
                        $match: {
                            'needAccommodation': true,
                            'location': {   
                                $exists: false
                            }
                        }
                    })
                }else{
                    criteriaAll.push({
                        $match: {
                            $or: [
                                {
                                    'needAccommodation': false,
                                },
                                {
                                    'needAccommodation': true,
                                    'location': {
                                        $exists: true
                                    }
                                }
                            ]
                        }
                    })
                }
            }

            if(query.sex){
                criteriaAll.push({
                    $match: {
                        'sex': query.sex
                    }
                })
            }

            if(populate.includes('location')){
                 criteriaAll.push(
                    {
                        $lookup: {
                            from: "addresses",
                            localField: "location",
                            foreignField: "_id",
                            as: "_location"
                        },
                    },
                    {
                        $unwind: {
                            path: '$_location',
                            preserveNullAndEmptyArrays: true
                        }
                    }
                )
            }
    
            const contacts = await Services.ContactService.aggregate(criteriaAll)
            return { contacts: contacts }
        } catch(err) {
            console.log(err)
            throw err
        }
    },
    checkRegistration: async(req) => {
        try{
            const { phone } = req.query
            const oldContact = (await Services.OldContactService.aggregate([
                {
                    $addFields: {
                        phone: {
                            $reduce: {
                            input: ["(", ")", " ", "-"],
                            initialValue: "$phone",
                            in: { $replaceAll: { input: "$$value", find: "$$this", replacement: "" } }
                            }
                        }
                    }
                },
                {
                    $match: {
                        phone: phone
                    }
                }
            ]))?.[0]
            if(!oldContact){
                throw {
                    statusCode: 404,
                    registered: false,
                    message: 'Old Contact not found!'
                }
            }

            return { contact: oldContact }
        }catch(err){
            console.log(err)
            throw err       
        }
    },
    createContact: async(req) => {
        try{
            const payload = req.payload
            if(payload.needAccommodation){
                let freeSpaces = (await Services.AddressService.aggregate(freeAddresses))?.[0]?.totalFreeSpots || 0

                let contactsNeedAccommodation = (await Services.ContactService.aggregate(contactsNeedAccommodationCriteria))?.[0]?.count || 0

                if(contactsNeedAccommodation >= freeSpaces){
                    throw  {
                        statusCode: 403,
                        message: 'Maximum accommodation limit reached'
                    }
                }
            }
            if(payload.age > 30 || payload.age < 15){
                throw {
                    statusCode: 403,
                    message: 'You are not passing age requirements'
                }
            }
            const contact = await Services.ContactService.create(payload)
            return { contact: contact }
        } catch(err) {
            console.log(err)
            throw err
        }
    },
    updateContact: async(req) => {
        const { _id } = req.params
        const contact = await Services.ContactService.getById(_id)
        if(!contact){
            throw {
                statusCode: 404,
                message: 'Contact not found!'
            }
        }

        const payload = req.payload
        if(payload.needAccommodation){
            let freeSpaces = (await Services.AddressService.aggregate(freeAddresses))?.[0]?.totalFreeSpots || 0

            let contactsNeedAccommodation = (await Services.ContactService.aggregate(contactsNeedAccommodationCriteria))?.[0]?.count || 0

            if(contactsNeedAccommodation >= freeSpaces){
                throw  {
                    statusCode: 403,
                    message: 'Maximum accommodation limit reached'
                }
            }
        }
        if(payload.location){
            let locationExists = await Services.AddressService.getById(payload.location)
            if(!locationExists){
                throw {
                    statusCode: 403,
                    message: 'Unable to update, location not found!'
                }
            }
        }
        if(payload.age && (payload.age > 30 || payload.age < 15)){
            throw {
                statusCode: 403,
                message: 'Not passing age requirements'
            }
        }
        const updatedContact = await Services.ContactService.updateOne({ _id: new ObjectId(_id) }, payload)
        return { contact: updatedContact }
    },
    deleteContact: async(req) => {
        try{
            const { _id } = req.params
            const contact = await Services.ContactService.getById(_id)
            if(!contact){
                throw {
                    statusCode: 404,
                    message: 'Contact not found!'
                }
            }
    
            await Services.ContactService.deleteOne({ _id: new ObjectId(_id) })
            return { deleted: true }
        } catch(err) {
            console.log(err)
            throw err
        }
    }
}