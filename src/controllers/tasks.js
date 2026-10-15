
const {
    listTasks,
    findTaskByTitle,
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
        const options = parseListQuery(req.query);
        res.json(await listTasks(options));
    } catch (error) {
        handleError(error, res);
    }
};

const queryError = (message) => {
    const error = new Error(message);
    error.name = 'ValidationError';
    throw error;
};

const taskFields = ['_id', 'title', 'done', 'priority', 'dueDate', 'tags', 'minutes', 'createdAt', 'updatedAt'];
const parseListQuery = (query) => {
    for (const value of Object.values(query)) {
        if (typeof value !== 'string') queryError('Los parámetros deben tener un único valor de texto');
    }
    const filter = {};
    if (query.done !== undefined) {
        if (!['true', 'false'].includes(query.done)) queryError('done debe ser true o false');
        filter.done = query.done === 'true';
    }
    if (query.priority !== undefined) {
        if (!['low', 'medium', 'high'].includes(query.priority)) queryError('priority debe ser low, medium o high');
        filter.priority = query.priority;
    }
    if (query.search !== undefined) {
        filter.title = { $regex: query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }
    if (query.tag !== undefined) filter.tags = query.tag;
    if (query.minMinutes !== undefined) {
        if (!query.minMinutes.trim() || !Number.isFinite(Number(query.minMinutes)) || Number(query.minMinutes) < 0) {
            queryError('minMinutes debe ser un número mayor o igual a cero');
        }
        filter.minutes = { $gte: Number(query.minMinutes) };
    }
    const positiveInteger = (name, fallback) => {
        if (query[name] === undefined) return fallback;
        if (!/^[1-9]\d*$/.test(query[name]) || !Number.isSafeInteger(Number(query[name]))) {
            queryError(`${name} debe ser un entero positivo`);
        }
        return Number(query[name]);
    };
    const page = positiveInteger('page', 1);
    const limit = positiveInteger('limit', 10);
    if (!Number.isSafeInteger((page - 1) * limit)) queryError('La paginación excede el rango permitido');
    let sort = { createdAt: 1, _id: 1 };
    if (query.sort !== undefined) {
        sort = {};
        for (const token of query.sort.split(',')) {
            const field = token.replace(/^-/, '');
            if (!taskFields.includes(field)) queryError('Campo de sort no válido');
            sort[field] = token.startsWith('-') ? -1 : 1;
        }
        if (!sort._id) sort._id = 1;
    }
    let fields;
    if (query.fields !== undefined) {
        const selected = query.fields.split(',');
        if (selected.some(field => !taskFields.includes(field))) queryError('Campo de fields no válido');
        fields = Object.fromEntries(selected.map(field => [field, 1]));
        if (!selected.includes('_id')) fields._id = 0;
    }
    return { filter, sort, page, limit, fields };
};

const getByTitle = async (req, res) => {
    try {
        if (typeof req.query.title !== 'string' || !req.query.title.trim()) {
            queryError('title es obligatorio');
        }
        const task = await findTaskByTitle(req.query.title.trim());
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json({ data: task });
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
    getByTitle,
    getById,
    create,
    update,
    remove
};
