import jwt from 'jwt-simple';
import moment from 'moment';

// Clave secreta
const secret = process.env.SECRET_KEY;

// Método para generar tokens
const createToken = (user) => {
    const payload = {
        userId: user._id,
        role: user.role,
        name: user.name,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
    };

    // Devolver el token creado
    return jwt.encode(payload, secret);
};
export {
    secret,
    createToken
};