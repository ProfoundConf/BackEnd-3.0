const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const { OLD_MONGODB_PATH } = process.env;

// Connect to the old MongoDB database
const oldDatabase = mongoose.createConnection(OLD_MONGODB_PATH);

// Define the Contact Schema
const OldContactSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    birthDay: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    church: {
        type: String,
        required: true
    },
    instagram: {
        type: String,
        required: false
    },
    preCreated:{
        type: Boolean,
        default: false
    },
    meta: {
        type: {
            day: {
                type: String,
                enum: ['Th','Fr','Sat'],
                required: true
            },
            dinner: {
                type: [String],
                required: true
            }
        },
        required: true,
        _id: false
    },
    location: {
        type: {
            address: {
                type: String,
                required: false,
            },
            phone: {
                type: String
            },
            name: {
                type: String
            },
            color: {
                type: String,
                required: false
            },
            needLiving: {
                type: Boolean,
                required: true
            }
        },
        required: true,
        _id: false
    },
    arrived: {
        type: Boolean,
        default: false
    }
  }, {versionKey: false, timestamps: false})
  
// Create the model using the `oldDatabase` connection
const ContactModel = oldDatabase.model("contact", OldContactSchema);

async function getById(id) {
  return ContactModel.findOne(
    { _id: new mongoose.Types.ObjectId(id) },
    null,
    { lean: true }
  );
}

async function get(criteria, projection = {}, options = {}) {
  options.lean = true;
  options.skip = Number(options.page);
  options.limit = Number(options.limit);

  return ContactModel.find(criteria, projection, options)
    .skip((options.skip - 1) * options.limit)
    .sort({ createdAt: -1 });
}

async function getOne(query, projection = {}) {
  return ContactModel.findOne(query, projection);
}

async function aggregate(criteria, populate) {
  let data = await ContactModel.aggregate(
    criteria?.length === 0 ? [{ $match: {} }] : criteria
  )
    .allowDiskUse(true)
    .exec();

  if (populate) {
    return await ContactModel.populate(data, populate);
  } else {
    return data;
  }
}

module.exports = {
  getById,
  get,
  getOne,
  aggregate,
}