import User from "../models/users.js";
import bcrypt from "bcrypt";
import { createToken } from "../services/jwt.js";


export const testUser = (req, res) => {
    return res.status(200).send(
        {
            message: "Mensaje enviado desde User.js"
        })
};
// Método Registro de Usuarios
export const register = async (req, res) => {
    try {
        // Obtener los datos de la petición
        let params = req.body;

        // Validaciones de los datos obtenidos
        if (!params.name || !params.last_name || !params.email || !params.password || !params.nick) {
            return res.status(400).send({
                status: "error",
                message: "Faltan datos por enviar"
            });
        }

        // Crear el objeto de usuario con los datos que ya validamos
        let user_to_save = new User(params);
        user_to_save.email = params.email.toLowerCase();

        // Busca si ya existe un usuario con el mismo email o nick
        const existingUser = await User.findOne({
            $or: [
                { email: user_to_save.email.toLowerCase() },
                { nick: user_to_save.nick.toLowerCase() }
            ]
        });

        // Si encuentra un usuario, devuelve un mensaje indicando que ya existe
        if (existingUser) {
            return res.status(409).send({
                status: "error",
                message: "!El usuario ya existe!"
            });
        }

        // Cifra la contraseña antes de guardarla en la base de datos
        const salt = await bcrypt.genSalt(10); // Genera una sal para cifrar la contraseña
        const hashedPassword = await bcrypt.hash(user_to_save.password, salt); // Cifra la contraseña
        user_to_save.password = hashedPassword; // Asigna la contraseña cifrada al usuario

        // Guardar el usuario en la base de datos
        await user_to_save.save();

        // Devolver el usuario registrado
        return res.status(200).json({
            status: "success",
            message: "Registro de usuario exitoso",          
            user_to_save
        });


    } catch (error) {
        // Manejo de errores
        console.log("Error en el registro de usuario:", error);
        // Devuelve mensaje de error
        return res.status(500).send({
            status: "error",
            message: "Error en el registro de usuario"
        });
    }
}
export const login = async (req, res) => {
    try {

        // Obtener los datos de la petición
        let params = req.body;

        // Validaciones de los datos obtenidos
        if (!params.password || !params.email) {
            return res.status(400).send({
                status: "error",
                message: "Faltan datos para iniciar sesion"
            });
        }

         // Buscar en la BD si existe el email recibido
        const user = await User.findOne({ email: params.email.toLowerCase() });
        
        if (!user) {
            return res.status(404).send({
                status: "error",
                message: "Usuario no encontrado"
            });
        }

        //Validar La contraseña 
        const validPassword = await bcrypt.compare(params.password, user.password); 
        
        //comprobar  constraseña
        if (!validPassword) {
            return res.status(401).send({
                status: "error",
                message: "Contraseña incorrecta"
            });
        }

        //Generar Token
        const token = createToken(user);

        //Devolver Token 

        return res.status(200).json({
            status: "success",
            message: "Login Exitoso",
            token,
            user: {
                id: user._id,
                name: user.name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                nick: user.nick,
                image: user.image,
                create_at:user.create_at
            }
        });


        

    } catch (error) {
        // Manejo de errores
        console.log("Error en el registro de usuario:", error);
        // Devuelve mensaje de error
        return res.status(500).send({
            status: "error",
            message: error

        });
    }
}

