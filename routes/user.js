import { Router } from "express";
const router = Router();
import { register, login, testUser } from "../controllers/userController.js";

// Definir las rutas
router.post('/register', register);
router.post('/login', login);
router.get('/test-User', testUser);


// Exportar el Router
export default router;