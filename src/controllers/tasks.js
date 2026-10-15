
const {
    listTasks,
    findTask,
    createTask,
    updateTask,
    removeTask
} = require('../data/tasks');

// Maneja los errores de la base de datos.
const handleError = (error, res) => {
    if (error.name === 'ValidationError' ||
        error.name === 'CastError') {
        return res.status(400).json({
            error: error.message
        });
    }

    console.error(error);

    return res.status(500).json({
        error: 'Error interno del servidor'
    });
};

// Lista todas las tareas.
const list = async (req, res) => {
    try {
        const data = await listTasks();
        res.json({ data });
    } catch (error) {
        handleError(error, res);
    }
};

// Busca una tarea por su ID.
const getById = async (req, res) => {
    try {
        const task = await findTask(req.params.id);

        if (!task) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        res.json({ data: task });
    } catch (error) {
        handleError(error, res);
    }
};

// Crea una nueva tarea.
const create = async (req, res) => {
    try {
        const {
            title,
            done,
            priority,
            dueDate,
            tags,
            minutes
        } = req.body ?? {};

        if (typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({
                error: 'El título es obligatorio'
            });
        }

        if (done !== undefined && typeof done !== 'boolean') {
            return res.status(400).json({
                error: 'El valor de done debe ser booleano'
            });
        }

        const task = await createTask({
            title,
            done,
            priority,
            dueDate,
            tags,
            minutes
        });

        res.status(201).json({ data: task });

    } catch (error) {
        handleError(error, res);
    }
};

// Actualiza una tarea existente.
const update = async (req, res) => {
    try {
        const {
            title,
            done,
            priority,
            dueDate,
            tags,
            minutes
        } = req.body ?? {};

        if (title !== undefined &&
            (typeof title !== 'string' || title.trim() === '')) {
            return res.status(400).json({
                error: 'El título no es válido'
            });
        }

        if (done !== undefined && typeof done !== 'boolean') {
            return res.status(400).json({
                error: 'El valor de done debe ser booleano'
            });
        }

        const task = await updateTask(req.params.id, {
            title,
            done,
            priority,
            dueDate,
            tags,
            minutes
        });

        if (!task) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        res.json({ data: task });

    } catch (error) {
        handleError(error, res);
    }
};

// Elimina una tarea.
const remove = async (req, res) => {
    try {
        const task = await removeTask(req.params.id);

        if (!task) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        res.json({ data: task });
    } catch (error) {
        handleError(error, res);
    }
};

module.exports = {
    list,
    getById,
    create,
    update,
    remove
};
