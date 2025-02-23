const Services = require('../Services')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { UnFx } = require('../Other/constants')
const { ContactModel } = require('../Models')

module.exports = {
    loginAdmin: async (req) => {
        const { email, password } = req.payload
        const admin = await Services.AdminService.getOne({ email: email })

        if(!admin){
            throw 'No admin with such email found!'
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password)
        if(!isPasswordValid){
            throw 'Invalid password'
        }

        const token = jwt.sign({ _id: admin._id, createdAt: Date.now() }, process.env.JWT_SECRET)
        await Services.AuthTokenService.create({ adminId: admin._id, accessToken: token })

        return { admin: admin, accessToken: token }
    },
    createAdmin: async(req) => {
        const { email, password, secret } = req.payload
        if(secret !== process.env.ADMIN_SECRET){
            throw {
                message: 'Invalid secret key!',
                statusCode: 403
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const admin = await Services.AdminService.create({ email: email, password: hashedPassword })
        return { admin: admin }
    },
    loginAdminViaAccessToken: async(req) => {
        const { accessToken } = req.payload
        const tokenExists = await Services.AuthTokenService.getOne({ accessToken: accessToken })
        if(!tokenExists){
            throw 'No token with such access token found!'
        }

        const { _id } = jwt.verify(accessToken, process.env.JWT_SECRET)
        const admin = await Services.AdminService.getById(_id)
        if(!admin){
            throw 'No admin with such id found!'
        }
        return { admin: admin, accessToken: accessToken }
    },
    logoutAdmin: async(req) => {
        const accessToken = req.auth.token
        await Services.AuthTokenService.deleteOne({ accessToken: accessToken })
        return { message: 'Successfully logged out' }
    }
}