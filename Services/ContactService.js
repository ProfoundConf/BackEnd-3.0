const Models = require('../Models')
const mongoose = require('mongoose')

module.exports = {
  create(data) {
    return Models.ContactModel.create(data)
  },
  getById: id => {
    return Models.ContactModel.findOne({ _id: new mongoose.Types.ObjectId(id) }, null, { lean: true })
  },
  get: (criteria, projection = {}, options = {}) => {
    options.lean = true
    options.skip = Number(options.page)
    options.limit = Number(options.limit)


    return Models.ContactModel.find(criteria, projection, options)
      .skip((options.skip - 1) * options.limit)
      .sort({ createdAt: -1 })
  },
  getOne: (query, projection = {}) => {
    return Models.ContactModel.findOne(query, projection)
  },
  aggregate: async (criteria, populate) => {
    let data = await Models.ContactModel.aggregate(criteria?.length === 0 ? [{ $match: {} }] : criteria).collation({ locale: 'uk', strength: 2 }).allowDiskUse(true).exec()

    if (populate) {
      return await Models.ContactModel.populate(data, populate)
    } else {
      return data
    }
  },
  updateOne: (criteria, dataToSet, options) => {
    options = options || {}
    options.lean = true
    options.new = true
    return Models.ContactModel.updateOne(criteria, dataToSet, options)
  },
  updateMany: (criteria, dataToSet, options) => {
    options = options || {}
    options.lean = true
    options.new = true
    return Models.ContactModel.updateMany(criteria, dataToSet, options)
  },
  deleteOne: (criteria) => Models.ContactModel.deleteOne(criteria)
}
