const {
    listTasks,
    findTask,
    createTask,
    updateTask,
    removeTask
} = require('../data/tasks');

// Responde con la lista completa de tareas disponibles.
const list = async (req, res) => {
    const data = await listTasks();
    res.json({ data });
};

// Obtiene una tarea por ObjectId y responde 404 si no existe.
const getById = async (req, res) => {
    const task = await findTask(req.params.id);
    if(!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ data: task });
};

// Valida el cuerpo de la petición y crea una nueva tarea.
const create = async (req, res) => {
    const { title, done } = req.body ?? {};
   
    if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Invalid title' });
    }
   const task = await createTask({ title, done });
   res.status(201).json({ data: task });
};

// Actualiza una tarea existente si el id existe y los datos son válidos.
const update = async (req, res) => {
    const { title, done } = req.body ?? {};
    if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Invalid title' });
    }
    if( done !== undefined && typeof done !== 'boolean') {
        return res.status(400).json({ error: 'Invalid done value' });
    }
    const task = await updateTask(req.params.id, { title, done });
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ data: task });
};

// Elimina una tarea por ObjectId y devuelve 404 cuando no existe.
const remove = async (req, res) => {
    const task = await removeTask(req.params.id);
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ data: task });
};

module.exports = {
    list,
    getById,
    create,
    update,
    remove
}