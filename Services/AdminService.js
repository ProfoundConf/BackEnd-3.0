const Models = require('../Models')
const mongoose = require('mongoose')

module.exports = {
  create(data) {
    return Models.AdminModel.create(data)
  },
  getById: id => {
    return Models.AdminModel.findOne({ _id: new mongoose.Types.ObjectId(id) }, null, { lean: true })
  },
  get: (criteria, projection = {}, options = {}) => {
    options.lean = true
    options.skip = Number(options.page)
    options.limit = Number(options.limit)


    return Models.AdminModel.find(criteria, projection, options)
      .skip((options.skip - 1) * options.limit)
      .sort({ createdAt: -1 })
  },
  getOne: (query, projection = {}) => {
    return Models.AdminModel.findOne(query, projection)
  },
  aggregate: async (criteria, populate) => {
    let data = await Models.AdminModel.aggregate(criteria).allowDiskUse(true).exec()

    if (populate) {
      return await Models.AdminModel.populate(data, populate)
    } else {
      return data
    }
  },
  updateOne: (criteria, dataToSet, options) => {
    options = options || {}
    options.lean = true
    options.new = true
    return Models.AdminModel.updateOne(criteria, dataToSet, options)
  },
  updateMany: (criteria, dataToSet, options) => {
    options = options || {}
    options.lean = true
    options.new = true
    return Models.AdminModel.updateMany(criteria, dataToSet, options)
  },
  deleteOne: (criteria) => Models.AdminModel.deleteOne(criteria)
}
