const Models = require('../Models')
const mongoose = require('mongoose')

module.exports = {
  create(data) {
    return Models.PaymentModel.create(data)
  },
  getById: id => {
    return Models.PaymentModel.findOne({ _id: new mongoose.Types.ObjectId(id) }, null, { lean: true })
  },
  get: (criteria, projection = {}, options = {}) => {
    options.lean = true
    options.skip = Number(options.page)
    options.limit = Number(options.limit)


    return Models.PaymentModel.find(criteria, projection, options)
      .skip((options.skip - 1) * options.limit)
      .sort({ createdAt: -1 })
  },
  getOne: (query, projection = {}) => {
    return Models.PaymentModel.findOne(query, projection)
  },
  aggregate: async (criteria, populate) => {
    let data = await Models.PaymentModel.aggregate(criteria).allowDiskUse(true).exec()

    if (populate) {
      return await Models.PaymentModel.populate(data, populate)
    } else {
      return data
    }
  },
  updateOne: (criteria, dataToSet, options) => {
    options = options || {}
    options.lean = true
    options.new = true
    return Models.PaymentModel.updateOne(criteria, dataToSet, options)
  },
  updateMany: (criteria, dataToSet, options) => {
    options = options || {}
    options.lean = true
    options.new = true
    return Models.PaymentModel.updateMany(criteria, dataToSet, options)
  },
  deleteOne: (criteria) => Models.PaymentModel.deleteOne(criteria)
}
