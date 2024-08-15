import { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connection = async () => {
    try {
        await connect(process.env.MONGODB_URI);
        console.log("conectado correctamente a la base de datos en Atlas db_social_network")
    } catch (error) {
        console.log("Error al conecta  al la base de datos ", error);
        throw new Error("¡no se ha podido conectar a la base de datos!");
    }
}
export default connection;