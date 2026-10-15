const mongoose = require('mongoose');
const Task = require('../models/Task');

// Recupera las tareas desde MongoDB ordenadas por fecha de creación.
const listTasks = () => Task.find().sort({ createdAt: 1 });

// Busca una tarea por su ObjectId si el formato es válido.
const findTask = (id) => {
    if (!mongoose.isValidObjectId(id)) return null;  
    return Task.findById(id);
};

// Crea un nuevo documento Task en MongoDB.
const createTask = ({title, done = false }) => {
    return Task.create({ title, done });
}

// Actualiza solo los campos enviados y devuelve el documento ya modificado.
const updateTask = (id, {title, done}) => {
    if (!mongoose.isValidObjectId(id)) return null;
    const changes = {};
    if (title !== undefined) changes.title = title;
    if (done !== undefined) changes.done = done;
    return Task.findByIdAndUpdate(id, changes, { new: true });
};

// Elimina una tarea por ObjectId y devuelve el documento eliminado.
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