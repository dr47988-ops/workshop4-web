const mongoose = require('mongoose');

// Define la estructura y reglas de validación del documento Task.
const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        done: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Exporta el modelo Task para consultas y escrituras sobre la colección tasks.
module.exports = mongoose.model('Task', taskSchema);