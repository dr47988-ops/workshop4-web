const express = require('express');
const tasks = require('../controllers/tasks');

const router = express.Router();

// Define los endpoints REST para operar sobre tareas.
router.get("/", tasks.list);
router.get("/by-title", tasks.getByTitle);
router.get("/stats", tasks.stats);
router.get("/:id", tasks.getById);
router.post("/", tasks.create);
router.put("/:id", tasks.update);
router.patch("/:id/done", tasks.markDone);
router.delete("/:id", tasks.remove);

module.exports = router;


