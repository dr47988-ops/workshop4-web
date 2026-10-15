# Express App

API REST construida con Express y MongoDB para gestionar tareas. El proyecto está organizado por capas para separar responsabilidades entre arranque del servidor, configuración de la aplicación, rutas HTTP, controladores, acceso a datos y modelo de Mongoose.

## Requisitos

- Node.js 18 o superior
- npm 9 o superior
- Una base de datos MongoDB accesible desde `MONGODB_URI`

## Variables de entorno

El proyecto usa `dotenv` para cargar configuración desde un archivo `.env`.

Variables necesarias:

- `PORT`: puerto local del servidor. Si no existe, se usa `3000`.
- `MONGODB_URI`: cadena de conexión de MongoDB Atlas o de una instancia local.

Ejemplo recomendado:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/expressapp
```

## Instalación

```bash
npm install
```

## Cómo ejecutar el proyecto

### Modo normal

```bash
npm start
```

Esto carga `.env`, intenta conectarse a MongoDB y solo después inicia el servidor en `http://localhost:3000` o en el puerto configurado.

### Modo desarrollo

```bash
npm run dev
```

Este modo usa `nodemon` para reiniciar el servidor automáticamente cuando cambian los archivos.

### Cambiar el puerto

En macOS o Linux:

```bash
PORT=4000 npm start
```

## Dependencias principales

- `express`: framework HTTP para exponer la API.
- `mongoose`: ODM para definir el modelo Task y operar con MongoDB.
- `dotenv`: carga variables de entorno desde `.env`.
- `nodemon`: reinicia el servidor automáticamente en desarrollo.

## Estructura del proyecto

```text
package.json
package-lock.json
.env
src/
  app.js
  db.js
  server.js
  controllers/
    tasks.js
  data/
    tasks.js
  models/
    Task.js
  routes/
    tasks.js
```

## Propósito de cada archivo

### `package.json`

- Declara el nombre del proyecto, dependencias y scripts disponibles.
- Define `src/server.js` como punto de entrada.

Scripts:

- `npm start`: ejecuta la aplicación en modo normal.
- `npm run dev`: ejecuta la aplicación con `nodemon`.

### `.env`

- Guarda la configuración sensible y específica del entorno.
- Define la conexión a MongoDB y el puerto del servidor.
- No debería compartirse públicamente ni subirse a un repositorio.

### `src/server.js`

- Carga variables de entorno antes de arrancar la aplicación.
- Conecta primero con MongoDB.
- Solo inicia el servidor HTTP si la conexión es exitosa.

Funciones y propósito:

- `require('dotenv').config()`: carga las variables del archivo `.env`.
- `connectDB()`: abre la conexión con MongoDB antes de aceptar peticiones.
- `app.listen(PORT, callback)`: inicia la aplicación y escribe en consola la URL local del servidor.
- `.catch((err) => ...)`: detiene el proceso si la conexión a la base de datos falla.

### `src/app.js`

- Crea la aplicación de Express.
- Registra middlewares y rutas principales.
- Exporta la instancia `app` para que `server.js` la arranque.

Funciones y propósito:

- `express()`: crea la instancia principal de la aplicación.
- `app.use(express.json())`: habilita la lectura de cuerpos JSON en peticiones `POST` y `PUT`.
- `app.get("/", handler)`: devuelve información general de la API y una lista de endpoints disponibles.
- `app.get("/api/health", handler)`: devuelve un estado simple para verificar que el servicio está activo.
- `app.use("/api/tasks", tasksRouter)`: monta todas las rutas de tareas bajo el prefijo `/api/tasks`.
- `app.use((req, res) => ...)`: middleware final para responder `404 Not Found` cuando la ruta no existe.

### `src/routes/tasks.js`

- Define las rutas HTTP relacionadas con tareas.
- Conecta cada endpoint con su función del controlador.

Funciones y propósito:

- `express.Router()`: crea un enrutador modular de Express.
- `router.get("/", tasks.list)`: lista todas las tareas.
- `router.get("/:id", tasks.getById)`: obtiene una tarea por identificador.
- `router.post("/", tasks.create)`: crea una nueva tarea.
- `router.put("/:id", tasks.update)`: actualiza una tarea existente.
- `router.delete("/:id", tasks.remove)`: elimina una tarea existente.

### `src/controllers/tasks.js`

- Contiene la lógica de entrada y salida HTTP.
- Valida el cuerpo de las peticiones.
- Decide qué código de estado y qué respuesta devolver.
- Trabaja con funciones asíncronas porque el acceso a datos ahora usa MongoDB.

Funciones y propósito:

- `list(req, res)`: obtiene todas las tareas desde la capa de datos y responde con `{ data: [...] }`.
- `getById(req, res)`: busca una tarea por `ObjectId`; si no existe responde `404`, si existe responde la tarea.
- `create(req, res)`: valida `title`, crea una tarea nueva y responde `201 Created`.
- `update(req, res)`: valida `title` y `done`, actualiza la tarea por `ObjectId` y responde `404` si no existe.
- `remove(req, res)`: elimina una tarea por `ObjectId` y responde `404` si no existe.

Validaciones implementadas:

- `title` debe ser un texto no vacío.
- `done`, si se envía, debe ser un booleano.
- El formato del `id` se valida en la capa de datos con `mongoose.isValidObjectId(id)`.

### `src/data/tasks.js`

- Centraliza las operaciones CRUD sobre la colección `tasks` en MongoDB.
- Encapsula las consultas a Mongoose para que los controladores no dependan directamente del modelo.

Funciones y propósito:

- `listTasks()`: devuelve todas las tareas ordenadas por fecha de creación.
- `findTask(id)`: valida el `ObjectId` y devuelve una tarea por identificador.
- `createTask({ title, done = false })`: crea un nuevo documento Task en la base de datos.
- `updateTask(id, { title, done })`: actualiza solo los campos enviados y devuelve el documento actualizado.
- `removeTask(id)`: elimina una tarea por identificador y devuelve el documento eliminado.

### `src/models/Task.js`

- Define el esquema de Mongoose para las tareas.
- Describe la forma del documento y sus validaciones básicas.

Campos del esquema:

- `title`: texto obligatorio; Mongoose elimina espacios sobrantes al inicio y al final.
- `done`: booleano opcional con valor por defecto `false`.
- `createdAt`: fecha generada automáticamente por `timestamps`.
- `updatedAt`: fecha de última actualización generada automáticamente por `timestamps`.

### `src/db.js`

- Centraliza la conexión a MongoDB.
- Verifica que la variable `MONGODB_URI` exista.
- Inserta datos iniciales si la colección está vacía.

Funciones y propósito:

- `connectDB()`: conecta Mongoose a MongoDB y realiza un seeding inicial si no hay tareas creadas.

## Modelo de datos

Cada tarea tiene esta forma:

```json
{
  "_id": "6710a8c6a3c95d92d92b4d1a",
  "title": "Sample Task 1",
  "done": false,
  "createdAt": "2026-10-14T18:00:00.000Z",
  "updatedAt": "2026-10-14T18:00:00.000Z"
}
```

Notas sobre el modelo:

- MongoDB usa `_id` como identificador único del documento.
- Los endpoints `GET /api/tasks/:id`, `PUT /api/tasks/:id` y `DELETE /api/tasks/:id` esperan ese `ObjectId`.

## Endpoints disponibles

### `GET /`

Devuelve información básica del servicio.

### `GET /api/health`

Devuelve el estado de salud de la API.

Respuesta esperada:

```json
{
  "status": "ok"
}
```

### `GET /api/tasks`

Lista todas las tareas.

### `GET /api/tasks/:id`

Obtiene una tarea por `ObjectId`.

Ejemplo:

```bash
curl http://localhost:3000/api/tasks/6710a8c6a3c95d92d92b4d1a
```

### `POST /api/tasks`

Crea una tarea nueva.

Ejemplo:

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Aprender Express","done":false}'
```

### `PUT /api/tasks/:id`

Actualiza una tarea existente.

Ejemplo:

```bash
curl -X PUT http://localhost:3000/api/tasks/6710a8c6a3c95d92d92b4d1a \
  -H "Content-Type: application/json" \
  -d '{"title":"Aprender Express 5","done":true}'
```

### `DELETE /api/tasks/:id`

Elimina una tarea existente.

Ejemplo:

```bash
curl -X DELETE http://localhost:3000/api/tasks/6710a8c6a3c95d92d92b4d1a
```

## Formato de respuestas

### Respuesta exitosa

Las operaciones devuelven los datos dentro de la propiedad `data`.

```json
{
  "data": {
    "_id": "6710a8c6a3c95d92d92b4d1a",
    "title": "Sample Task 1",
    "done": false,
    "createdAt": "2026-10-14T18:00:00.000Z",
    "updatedAt": "2026-10-14T18:00:00.000Z"
  }
}
```

### Respuesta de error

Los errores devuelven una propiedad `error` con un mensaje simple.

```json
{
  "error": "Task not found"
}
```

## Limitaciones actuales

- No hay autenticación ni autorización.
- No existe manejo centralizado de errores para excepciones asíncronas.
- No hay paginación, filtros ni búsqueda.
- No existen pruebas automatizadas todavía.

## Flujo interno de una petición

1. `server.js` carga `.env` y ejecuta `connectDB()`.
2. `db.js` establece la conexión con MongoDB y realiza el seeding inicial si la colección está vacía.
3. `app.js` recibe la petición y la dirige a la ruta correcta.
4. `routes/tasks.js` selecciona la función del controlador.
5. `controllers/tasks.js` valida la entrada y llama a la capa de datos.
6. `data/tasks.js` usa el modelo `Task` para leer o modificar documentos en MongoDB.
7. El controlador devuelve la respuesta JSON al cliente.

## Datos iniciales automáticos

Cuando la aplicación se conecta a MongoDB por primera vez y la colección de tareas está vacía, inserta dos documentos iniciales:

- `Sample Task 1`
- `Sample Task 2`

Esto ocurre en `src/db.js` y facilita probar la API sin cargar datos manualmente.