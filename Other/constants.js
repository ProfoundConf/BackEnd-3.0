const UnFx = {
    sendSuccess: (hapi, data = {}, message = "Success", statusCode = 200) => {
        return hapi.response({ success: true, message, data }).code(statusCode);
    },
    sendError: (hapi, data = {}, message = "Error", statusCode = 400) => {
        return hapi.response({ success: false, message, data }).code(statusCode);
    },
    failAction: (r, hapi, error) => UnFx.sendError(hapi, { message: "Validation failed: " + error.details.map(d => `${d.message}`).join(", ") }, 400).takeover()
}

const constants = {

}

module.exports = {
    UnFx: UnFx,
    constants: constants
}