import { Router } from "express";
const router = Router();
import { register, login, testUser } from "../controllers/userController.js";
import { ensureAuth } from "../middlewares/auth.js";

// Definir las rutas
router.post('/register', register);
router.post('/login', login);
router.get('/test-User', ensureAuth, testUser);


// Exportar el Router
export default router;