
const mongoose = require('mongoose');
const Task = require('../models/Task');

// Recupera todas las tareas ordenadas por fecha de creación.
const listTasks = () => {
    return Task.find().sort({ createdAt: 1 });
};

// Busca una tarea por su ObjectId.
const findTask = (id) => {
    if (!mongoose.isValidObjectId(id)) return null;

    return Task.findById(id);
};

// Crea una nueva tarea con sus campos.
const createTask = (data) => {
    return Task.create(data);
};

// Actualiza los campos enviados y ejecuta las validaciones.
const updateTask = (id, data) => {
    if (!mongoose.isValidObjectId(id)) return null;

    const allowedFields = [
        'title',
        'done',
        'priority',
        'dueDate',
        'tags',
        'minutes'
    ];

    const changes = {};

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            changes[field] = data[field];
        }
    }

    return Task.findByIdAndUpdate(id, changes, {
        new: true,
        runValidators: true
    });
};

// Elimina una tarea por su ObjectId.
const removeTask = (id) => {
    if (!mongoose.isValidObjectId(id)) return null;

    return Task.findByIdAndDelete(id);
};

module.exports = {
    listTasks,
    findTask,
    createTask,
    updateTask,
    removeTask
};
