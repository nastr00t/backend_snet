import { Router } from "express";
const router = Router();
import { testFollow } from "../controllers/followController.js";

// Definir las rutas
router.get('/test-follow', testFollow);

// Exportar el Router
export default router;