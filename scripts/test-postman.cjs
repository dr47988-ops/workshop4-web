// Ejecuta la colección de Postman contra una base temporal, sin tocar los datos del usuario.
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const newman = require('newman');
const app = require('../src/app');

(async () => {
    let mongo;
    let server;
    try {
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
        server = await new Promise(resolve => {
            const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
        });
        await new Promise((resolve, reject) => newman.run({
            collection: require('../postman/workshop4.postman_collection.json'),
            envVar: [{ key: 'baseUrl', value: `http://127.0.0.1:${server.address().port}` }],
            reporters: ['cli']
        }, (error, summary) => {
            if (error) return reject(error);
            if (summary.run.failures.length) return reject(new Error('Fallaron las pruebas de Postman'));
            resolve();
        }));
    } finally {
        if (server) await new Promise(resolve => server.close(resolve));
        await mongoose.disconnect();
        if (mongo) await mongo.stop();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
