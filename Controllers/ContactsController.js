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
    getContactsForLiving: async(req) => {
        try{
            const groupCriteria = [
                {
                    $match: {
                        'needAccommodation': true
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
    
            const contacts = await Services.ContactService.aggregate(criteriaAll)
            return { contacts: contacts }
        } catch(err) {
            console.log(err)
            throw err
        }
    },
    createContact: async(req) => {
        try{
            const payload = req.payload
            // if(payload.location.needAccommodation){
            //     let accommodationCount = (await Services.ContactService.aggregate([
            //         {
            //             $match: {
            //                 'location.needAccommodation': true
            //             }
            //         },
            //         {
            //             $count: 'count'
            //         }
            //     ]))?.[0]?.count || 0
            //     if(accommodationCount >= constants.ACCOMMODATION_LIMIT){
            //         throw 'No space left for accommodation!'
            //     }
            // }
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
            throw 'Contact not found!'
        }

        const payload = req.payload
        const updatedContact = await Services.ContactService.updateOne({ _id: new ObjectId(_id) }, payload)
        return { contact: updatedContact }
    },
    deleteContact: async(req) => {
        try{
            const { _id } = req.params
            const contact = await Services.ContactService.getById(_id)
            if(!contact){
                throw 'Contact not found!'
            }
    
            await Services.ContactService.deleteOne({ _id: new ObjectId(_id) })
            return { message: 'Contact Deleted Succesful!' }
        } catch(err) {
            console.log(err)
            throw err
        }
    }
}