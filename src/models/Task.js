const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'El título es obligatorio'],
            trim: true,
            minlength: [3, 'El título debe tener al menos 3 caracteres']
        },

        done: {
            type: Boolean,
            default: false
        },

        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },

        dueDate: {
            type: Date,
            validate: {
                validator: function (value) {
                    return !value || !isNaN(value.getTime());
                },
                message: 'La fecha no es válida'
            }
        },

        tags: {
            type: [String],
            default: []
        },

        minutes: {
            type: Number,
            min: [0, 'Los minutos no pueden ser negativos'],
            default: 0
        }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: function (doc, ret) {
                ret.id = ret._id.toString();
                delete ret._id;
                return ret;
            }
        }
    }
);

// Virtual que muestra un resumen de la tarea
taskSchema.virtual('summary').get(function () {
    return `${this.title} - ${this.done ? 'Terminada' : 'Pendiente'}`;
});

// Método del documento: marca la tarea como terminada y la guarda.
taskSchema.methods.markDone = function () {
    this.done = true;
    return this.save();
};

// Método estático: devuelve solo las tareas pendientes.
taskSchema.statics.findPending = function () {
    return this.find({ done: false });
};

// Antes de guardar: normaliza el título (minúsculas) y avisa en consola.
taskSchema.pre('save', function () {
    this.title = this.title.toLowerCase();
    console.log(`Guardando tarea: "${this.title}"`);
});

// Después de guardar: imprime el ID de la tarea guardada.
taskSchema.post('save', function (doc) {
    console.log(`Tarea guardada con ID: ${doc._id}`);
});

module.exports = mongoose.model('Task', taskSchema);