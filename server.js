'use strict';

const Hapi = require('@hapi/hapi');
const dotenv = require('dotenv');
const mongoose = require('mongoose')

const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const Joi = require('joi');
const Pack = require('./package.json');
const { registerAuth } = require('./Other/auth')

dotenv.config()

const { RAILWAY_PUBLIC_DOMAIN: API_PATH, API_HOST, MONGODB_PATH, NODE_ENV } = process.env

const routes = require('./Routes/index')
if(process.env.NODE_ENV !== 'LOCAL'){
    const telegram = require('./Routes/TelegramRoute')
}


const init = async () => {
    // Create a new Hapi server instance
    const server = Hapi.server({
        port: API_HOST,        // Set the port
        host: NODE_ENV === 'LOCAL' ? API_PATH : '0.0.0.0', // Set the host
        routes: {
            cors: {
                origin: ['*'], // Allow all origins
                headers: ['Accept', 'Content-Type', 'Authorization'], // Allowed headers
                credentials: true // Allow credentials (cookies, auth headers, etc.)
            }
        }
    });

    registerAuth(server)

    const swaggerOptions = {
        info: {
            title: 'API Documentation',
            version: Pack.version,
        },
    };
    
    // Basic route: Responds when accessed via GET
    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            let responseText = `<p>Profound Backend is working good</p>`;
    
            if (API_PATH && API_HOST) {
                responseText += `<p><a href="http${NODE_ENV === 'LOCAL' ? '' : 's'}://${API_PATH}:${API_HOST}/documentation#/">API Documentation</a></p>`;
            }
    
            return h.response(responseText).type('text/html');
        }
    });

    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: swaggerOptions
        }
    ])

    server.ext('onRequest', (request, h) => {
        console.log(`Incoming Request: ${request.method.toUpperCase()} ${request.path}`);
        return h.continue;
    });

    // Log after the response is sent
    server.ext('onPreResponse', (request, h) => {
        const response = request.response;
        if (response.isBoom) {
            console.error(`${response.output.statusCode} ${response.output.payload.message}`);
        } else {
            console.log(`Response to Request: ${request.method.toUpperCase()} ${request.path} ${response.statusCode}`);
        }
        return h.continue;
    })
    
    server.route(routes)

    // Start the server
    await server.start();
    console.log('Server running on %s', server.info.uri);
    // Conecting to mongoDb
    let mongoRes = await mongoose.connect(MONGODB_PATH)
    console.log('MongoDB Connected!',mongoRes?.connections?.[0]?._connectionString || '')
};

// Handle any errors when starting the server
process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

// Initialize the server
init()