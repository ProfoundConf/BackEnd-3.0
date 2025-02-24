const UnFx = {
    sendSuccess: (data = {}, hapi, message = "Success", statusCode = 200) => hapi.response({ success: true, message, data }).code(statusCode),
    sendError: (data = {}, hapi, message = "Error", statusCode = 400) => {
        return hapi.response({ success: false, message: message, data }).code(data.statusCode || statusCode)
    },
    failAction: (req, hapi, error) => UnFx.sendError({ message: "Validation failed: " + error.details.map(d => `${d.message}`).join(", ") }, hapi, 400).takeover()
}

const constants = {
    ACCOMMODATION_LIMIT: 90
}

module.exports = {
    UnFx: UnFx,
    constants: constants
}