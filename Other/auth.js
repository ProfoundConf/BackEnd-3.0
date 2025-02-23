const dotenv = require('dotenv');
const Services = require('../Services')

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET

const validate = async (decoded, req, h) => {
    try {
        const accessToken = req.auth.token
        if (!decoded || !decoded._id || !accessToken) {
            return { isValid: false };
        }
        
        const accessTokenExists = await Services.AuthTokenService.getOne({ accessToken: accessToken });
        if (!accessTokenExists) {
            return { isValid: false };
        }

        const admin = await Services.AdminService.getById(decoded._id);
        if (!admin) {
            return { isValid: false };
        }

        return { isValid: true, credentials: admin };
    } catch (error) {
        return { isValid: false };
    }
};

const registerAuth = async (server) => {
    await server.register(require('hapi-auth-jwt2'));

    server.auth.strategy('jwt', 'jwt', {
        key: JWT_SECRET,
        validate: validate,
        verifyOptions: { algorithms: ['HS256'] }
    });

    server.auth.default('jwt');
};

module.exports = {
    registerAuth
}