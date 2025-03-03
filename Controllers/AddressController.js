const Services = require('../Services')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { UnFx, constants } = require('../Other/constants')
const ObjectId = require('mongoose').Types.ObjectId

module.exports = {
    getAddressById: async(req) => {
        try{
            const { _id } = req.params
            const populate = req.query?.populate || []
            const address = await Services.AddressService.getById(_id)
            if(!address){
                throw 'Address Not Found!'
            }
            
            if(populate.includes('contacts')){
                address._contacts = await Services.ContactService.get({ location: new ObjectId(_id) })
            }
            return { address: address }
        } catch(err) {
            console.log(err)
            throw err
        }
    },
    getAddress: async(req) => {
        try{
            const query = req.query || {}
            const populate = req.query.populate || []

            let criteriaAll = []

            if(query.address){
                criteriaAll.push({ address: { $regex: query.address, $options: 'i' } })
            }

            if(query.phone){
                criteriaAll.push({ phone: { $regex: query.phone, $options: 'i' } })
            }

            if(query.name){
                criteriaAll.push({ name: { $regex: query.name, $options: 'i' } })
            }
            
            if(query.maxCount){
                criteriaAll.push({ maxCount: query.maxCount })
            }

            if(query.femaleCount){
                criteriaAll.push({ femaleCount: query.femaleCount })
            }

            if(query.maleCount){
                criteriaAll.push({ maleCount: query.maleCount })
            }

            if(populate.includes('contacts')){
                criteriaAll.push({ $lookup: { from: 'contacts', localField: '_id', foreignField: 'location', as: '_contacts' } })
            }
    
            const addresses = await Services.AddressService.aggregate(criteriaAll)
            return { addresses: addresses }
        } catch(err) {
            console.log(err)
            throw err
        }
    },
    createAddress: async(req) => {
        try{
            const payload = req.payload
            const address = await Services.AddressService.create(payload)
            return { address: address }
        } catch(err) {
            console.log(err)
            throw err
        }
    },
    updateAddress: async(req) => {
        try{
            const { _id } = req.params
            const address = await Services.AddressService.getById(_id)
            if(!address){
                throw 'Contact not found!'
            }
    
            const payload = req.payload
            const updatedAddress = await Services.AddressService.updateOne({ _id: new ObjectId(_id) }, payload)
            return { address: updatedAddress }
        } catch(err) {
            console.log(err)
            throw err
        }
    },
    deleteAddress: async(req) => {
        try{
            const { _id } = req.params
            const address = await Services.AddressService.getById(_id)
            if(!address){
                throw 'Address not found!'
            }
            await Services.AddressService.deleteOne({ _id: new ObjectId(_id) })
            return { message: 'Address Deleted Successful!' }
        } catch(err) {
            console.log(err)
            throw err
        }
    },
}