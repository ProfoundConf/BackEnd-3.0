const AddressRoutes = require('./AddressRoutes')
const AdminLoginRoutes = require('./AdminLoginRoutes')
const ContactsRoutes = require('./ContactsRoutes')

module.exports = [].concat(
    AdminLoginRoutes,
    ContactsRoutes,
    AddressRoutes
)