const cron = require('node-cron')
const moment = require('moment')
const Services = require('../Services')

const removeContacts = async () => {
    const contacts = await Services.ContactService.get(
        {
            createdAt: {
                $lt: moment().subtract(1, 'day').toDate()
            },
            paid: false
        }
    )

    if(!contacts?.length){
        return
    }

    for(let contact of contacts){
        await Services.ContactService.deleteOne({ _id: contact._id })
    }
    console.log('Removed Contacts', contacts.length)
}

cron.schedule('*/10 * * * *', removeContacts)
removeContacts()