const mongoose = require('mongoose');
const Task = require('./models/Task');

// Abre la conexión principal a MongoDB usando la URI cargada desde .env.
const connectDB = async () => {
    const URI = process.env.MONGODB_URI;
    if (!URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }
    await mongoose.connect(URI);

    // Si la colección está vacía, inserta datos iniciales para pruebas rápidas.
    const count = await Task.countDocuments();

    if (count === 0) {
        await Task.insertMany([
            { title: 'Sample Task 1' },
            { title: 'Sample Task 2' }
        ]);
    }
}

module.exports = connectDB;