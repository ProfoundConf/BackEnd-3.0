const Models = require('../Models')
const mongoose = require('mongoose')

module.exports = {
  getById: id => {
    return Models.AuthTokenModel.findOne({ _id: new mongoose.Types.ObjectId(id) }, null, { lean: true })
  },
  get: (criteria, projection = {}, options = {}) => {
    options.lean = true
    options.skip = Number(options.page)
    options.limit = Number(options.limit)


    return Models.AuthTokenModel.find(criteria, projection, options)
      .skip((options.skip - 1) * options.limit)
      .sort({ createdAt: -1 })
  },
  getOne: (query, projection = {}) => {
    return Models.AuthTokenModel.findOne(query, projection)
  },
  aggregate: async (criteria, populate) => {
    let data = await Models.AuthTokenModel.aggregate(criteria).allowDiskUse(true).exec()

    if (populate) {
      return await Models.AuthTokenModel.populate(data, populate)
    } else {
      return data
    }
  },
  updateOne: (criteria, dataToSet, options) => {
    options = options || {}
    options.lean = true
    options.new = true
    return Models.AuthTokenModel.updateOne(criteria, dataToSet, options)
  },
  updateMany: (criteria, dataToSet, options) => {
    options = options || {}
    options.lean = true
    options.new = true
    return Models.AuthTokenModel.updateMany(criteria, dataToSet, options)
  },
  deleteOne: (criteria) => Models.AuthTokenModel.deleteOne(criteria)
}
