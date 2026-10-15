require('dotenv').config();

const app = require('./app');
const connectDB = require('./db');

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    // Inicia el servidor HTTP usando el puerto configurado o el 3000 por defecto.
    app.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database', err.message);
    process.exit(1);
  });

