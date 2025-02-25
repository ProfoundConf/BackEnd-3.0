const Models = require('../Models')
const mongoose = require('mongoose')

module.exports = {
  create(data) {
    return Models.AddressModel.create(data)
  },
  getById: id => {
    return Models.AddressModel.findOne({ _id: new mongoose.Types.ObjectId(id) }, null, { lean: true })
  },
  get: (criteria, projection = {}, options = {}) => {
    options.lean = true
    options.skip = Number(options.page)
    options.limit = Number(options.limit)


    return Models.AddressModel.find(criteria, projection, options)
      .skip((options.skip - 1) * options.limit)
      .sort({ createdAt: -1 })
  },
  getOne: (query, projection = {}) => {
    return Models.AddressModel.findOne(query, projection)
  },
  aggregate: async (criteria, populate) => {
    let data = await Models.AddressModel.aggregate(criteria?.length === 0 ? [{ $match: {} }] : criteria).allowDiskUse(true).exec()

    if (populate) {
      return await Models.AddressModel.populate(data, populate)
    } else {
      return data
    }
  },
  updateOne: (criteria, dataToSet, options) => {
    options = options || {}
    options.lean = true
    options.new = true
    return Models.AddressModel.findOneAndUpdate(criteria, dataToSet, options)
  },
  updateMany: (criteria, dataToSet, options) => {
    options = options || {}
    options.lean = true
    options.new = true
    return Models.AddressModel.updateMany(criteria, dataToSet, options)
  },
  deleteOne: (criteria) => Models.AddressModel.deleteOne(criteria)
}
