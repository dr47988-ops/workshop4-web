
const mongoose = require('mongoose');
const Task = require('../models/Task');

// Recupera todas las tareas ordenadas por fecha de creación.
const listTasks = async ({ filter = {}, sort = { createdAt: 1, _id: 1 }, page = 1, limit = 10, fields } = {}) => {
    // Con ?done=false se usa el método estático findPending().
    const base = filter.done === false ? Task.findPending().find(filter) : Task.find(filter);
    const query = base.sort(sort).skip((page - 1) * limit).limit(limit);
    if (fields) query.select(fields);
    // lean conserva exactamente la proyección sin agregar virtuales del modelo.
    const [data, total] = await Promise.all([query.lean(), Task.countDocuments(filter)]);
    return { data, total };
};

const validateId = (id) => {
    if (!mongoose.isObjectIdOrHexString(id)) {
        const error = new Error('El id debe ser un ObjectId válido');
        error.name = 'ValidationError';
        throw error;
    }
};

const findTaskByTitle = (title) => Task.findOne({ title });

// Busca una tarea por su ObjectId.
const findTask = (id) => {
    validateId(id);

    return Task.findById(id);
};

// Crea una nueva tarea con sus campos.
const createTask = (data) => {
    return Task.create(data);
};

// Actualiza los campos enviados y ejecuta las validaciones.
const updateTask = (id, data) => {
    validateId(id);

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
    validateId(id);

    return Task.findByIdAndDelete(id);
};

// Marca una tarea como terminada con el método del documento markDone().
const markTaskDone = async (id) => {
    validateId(id);

    const task = await Task.findById(id);
    if (!task) return null;

    return task.markDone();
};

// Calcula cuántas tareas hay pendientes, terminadas y por prioridad.
const getStats = async () => {
    const [pending, done, grouped] = await Promise.all([
        Task.countDocuments({ done: false }),
        Task.countDocuments({ done: true }),
        Task.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }])
    ]);

    const byPriority = { low: 0, medium: 0, high: 0 };
    for (const { _id, count } of grouped) byPriority[_id] = count;

    return { pending, done, byPriority };
};

module.exports = {
    listTasks,
    findTaskByTitle,
    findTask,
    createTask,
    updateTask,
    removeTask,
    markTaskDone,
    getStats
};
