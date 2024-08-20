
import express, { json, urlencoded } from "express";
import connection from "./database/connection.js";
import bodyParser from "body-parser";
import cors from "cors";
import UserRoutes from "./routes/user.js"
import PublicationRoutes from "./routes/publication.js"
import FollowRoutes from "./routes/follow.js"


// Mensaje de bienvenida para verificar que ejecutó bien la API de Node
console.log("API Node en ejecución");

// Conexión a la BD
connection();

// Crear el servidor de Node
const app = express();
const puerto = process.env.PORT || 3900;

// Configurar cors para hacer las peticiones correctamente
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD, PUT,PATCH,POST,DELETE'
}));

// Decodificar los datos desde los formularios para convertirlos en objetos JS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar rutas del aplicativo
app.use('/api/user', UserRoutes);
app.use('/api/publication', PublicationRoutes);
app.use('/api/follow', FollowRoutes);

// Configurar el servidor Node
app.listen(puerto, () => {
    console.log("Servidor de Node ejecutándose en el puerto", puerto);
});

export default app;