import User from "../models/users.js";
import bcrypt from "bcrypt";
import { createToken } from "../services/jwt.js";
import path from "path";

import fs from "fs";


export const testUser = (req, res) => {
    return res.status(200).send(
        {
            message: "Mensaje enviado desde User.js",
            user: req.user
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
//Metodo para mostrar el perfil del usuario 
export const profile = async (req, res) => {
    try {

        // Obtener el ID del usuario desde los parámetros de la URL
        const userId = req.params.id;

        // Verificar si el ID recibido del usuario autenticado existe
        if (!userId) {
            return res.status(404).send({
                status: "error",
                message: "Usuario no Id no enviado"
            });
        }

        // Buscar al usuario en la BD, excluimos la contraseña, rol, versión.
        const userProfile = await User.findById(userId).select('-password -role -email -__v');

        // Verificar si el usuario no  existe
        if (!userProfile) {
            return res.status(404).send({
                status: "error",
                message: "Usuario no encontrado"
            });
        }


        // Devolver la información del perfil del usuario
        return res.status(200).json({
            status: "success",
            user: userProfile

        });


    } catch (error) {
        console.log("Error al obtener el perfil del usuario:", error)
        return res.status(500).send({
            status: "error",
            message: "Error al obtener el perfil del usuario"
        });
    }
}

// Método para listar usuarios con paginación
export const listUsers = async (req, res) => {
    try {
        // Controlar en qué página estamos y el número de ítemas por página
        let page = req.params.page ? parseInt(req.params.page, 10) : 1;
        let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 3;

        // Realizar la consulta paginada
        const options = {
            page: page,
            limit: itemsPerPage,
            select: '-password -role -__v -email'
        };

        const users = await User.paginate({}, options);

        // Si no hay usuario en la página solicitada
        if (!users || users.docs.length === 0) {
            return res.status(404).send({
                status: "error",
                message: "No hay usuarios disponibles"
            });
        }

        // Devolver los usuarios paginados
        return res.status(200).json({
            status: "success",
            users: users.docs,
            totalDocs: users.totalDocs,
            totalPages: users.totalPages,
            page: users.page,
            pagingCounter: users.pagingCounter,
            hasPrevPage: users.hasPrevPage,
            hasNextPage: users.hasNextPage,
            prevPage: users.prevPage,
            nextPage: users.nextPage

        });
    } catch (error) {
        console.log("Error al listar los usuarios:", error);
        return res.status(500).send({
            status: "error",
            message: "Error al listar los usuarios"
        });
    }
}
// Método para actualizar los datos del usuario
export const updateUser = async (req, res) => {
    try {
        // Obtener la información del usuario a actualizar
        let userIdentity = req.user;
        let userToUpdate = req.body;

        // Validar que los campos necesarios estén presentes
        if (!userToUpdate.email || !userToUpdate.nick) {
            return res.status(400).send({
                status: "error",
                message: "¡Los campos email y nick son requeridos!"
            });
        }


        // Eliminar campos que sobran
        delete userToUpdate.iat;
        delete userToUpdate.exp;
        delete userToUpdate.role;

        // Comprobar si el usuario ya existe
        const users = await User.find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { nick: userToUpdate.nick.toLowerCase() }
            ]
        }).exec();

        // Verificar si el usuario está duplicado y evitar conflicto
        const isDuplicateUser = users.some(user => {
            return user && user._id.toString() !== userIdentity.userId;
        });


        if (isDuplicateUser) {
            return res.status(400).send({
                status: "error",
                message: "Solo se puede modificar los datos del usuario logueado."
            });
        }

        // Cifrar la contraseña si se proporciona
        if (userToUpdate.password) {
            try {
                let pwd = await bcrypt.hash(userToUpdate.password, 10);
                userToUpdate.password = pwd;
            } catch (hashError) {
                return res.status(500).send({
                    status: "error",
                    message: "Error al cifrar la contraseña"
                });
            }
        } else {
            delete userToUpdate.password;
        }


        // Buscar y Actualizar el usuario a modificar en la BD
        let userUpdated = await User.findByIdAndUpdate(userIdentity.userId, userToUpdate, { new: true });

        if (!userUpdated) {
            return res.status(400).send({
                status: "error",
                message: "Error al actualizar el usuario"
            });
        }

        // Devolver respuesta exitosa con el usuario actualizado
        return res.status(200).json({
            status: "success",
            message: "¡Usuario actualizado correctamente!",
            user: userUpdated
        });
    } catch (error) {
        console.log("Error al actualizar los datos del usuario", error);
        return res.status(500).send({
            status: "error",
            message: "Error al actualizar los datos del usuario"
        });
    }
}

// Método para subir AVATAR (imagen de perfil) y actualizar el campo image del User
export const uploadAvatar = async (req, res) => {
    try {
        // Obtener el archivo de la imagen y comprobar si existe
        if (!req.file) {
            return res.status(404).send({
                status: "error",
                message: "Error la petición no incluye la imagen"
            });
        }

        // Obtener el nombre del archivo
        let image = req.file.originalname;

        // Obtener la extensión del archivo
        const imageSplit = image.split(".");
        const extension = imageSplit[imageSplit.length - 1];

        // Validar la extensión
        if (!["png", "jpg", "jpeg", "gif"]) {
            // Borrar archivo subido
            const filePath = req.file.path;
            fs.unlinkSync(filePath);

            return res.status(404).send({
                status: "error",
                message: "Extensión del archivo inválida. Solo se permite: png, jpg, jpeg, gif"
            });
        }
        // Comprobar tamaño del archivo (pj: máximo 1MB)
        const fileSize = req.file.size;
        const maxFileSize = 1 * 1024 * 1024; // 1 MB

        if (fileSize > maxFileSize) {
            const filePath = req.file.path;
            fs.unlinkSync(filePath);

            return res.status(400).send({
                status: "error",
                message: "El tamaño del archivo excede el límite (máx 1 MB)"
            });
        }

        // Guardar la imagen en la BD
        const userUpdated = await User.findOneAndUpdate(
            { _id: req.user.userId },
            { image: req.file.filename },
            { new: true }
        );

        // verificar si la actualización fue exitosa
        if (!userUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Eror en la subida de la imagen"
            });
        }

        // Devolver respuesta exitosa 
        return res.status(200).json({
            status: "success",
            user: userUpdated,
            file: req.file
        });

    } catch (error) {
        console.log("Error al subir archivos", error)
        return res.status(500).send({
            status: "error",
            message: "Error al subir archivos"
        });
    }
}
//Metodo para mostrar el Avatar
export const avatar = async (req, res) => {
    try {


        const file = req.params.file;

        // Verificar si el ID recibido del usuario autenticado existe
        if (!file) {
            return res.status(404).send({
                status: "error",
                message: "Archivo no enviado"
            });
        }
        const filePath = "./uploads/avatars/" + file;

        //comprobar que si exsite el filepath
        fs.stat(filePath, (error, exists) => {
            if (!filePath) {
                return res.status(404).send({
                    status: "error",
                    message: "Archivo no Existe"
                });
            }
        });

        return res.sendFile(path.resolve(filePath));

    } catch (error) {
        // Manejo de errores
        console.log("Error al mostrar la imagen:", error);
        // Devuelve mensaje de error
        return res.status(500).send({
            status: "error",
            message: error

        });
    }
}