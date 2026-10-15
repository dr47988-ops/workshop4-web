const express = require('express');
const tasksRouter = require('./routes/tasks');

const app = express();

// Habilita el parseo automático de cuerpos JSON.
app.use(express.json());

// Expone una página JSON simple con información básica del servicio.
app.get("/", (req, res) => {
    res.json({
        name: "Express App",
        message: "Hello, world!",
        endpoints: [
            "GET /api/health",
            "GET /api/tasks",
            "GET /api/tasks/by-title?title=Ejemplo",
            "GET /api/tasks/stats",
            "GET /api/tasks/:id",
            "POST /api/tasks",
            "PUT /api/tasks/:id",
            "PATCH /api/tasks/:id/done",
            "DELETE /api/tasks/:id",
        ],
    });
});

// Endpoint de verificación rápida para comprobar que la API responde.
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

// Monta todas las rutas de tareas bajo el prefijo /api/tasks.
app.use("/api/tasks", tasksRouter);

// Respuesta por defecto para cualquier ruta no registrada.
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found"
    });
});

module.exports = app;
