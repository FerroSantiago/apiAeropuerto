import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async (req, res) => {
  //Encabezados CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  try {
    const client = await clientPromise;
    const db = client.db("aeropuerto");

    // Verificar si es una solicitud OPTIONS
    if (req.method === 'OPTIONS') {
      // Responder con un estado 200 OK para la solicitud OPTIONS
      return res.status(200).end();
    }


    if (req.method === "GET") {
      // Obtener las maletas de un pasajero
      const { pasajeroId } = req.query;

      // Validar el ID de pasajero recibido
      if (!pasajeroId || !ObjectId.isValid(pasajeroId)) {
        return res.status(400).json({ error: "ID de pasajero inválido" });
      }

      const filtro = { pasajeroId: ObjectId(pasajeroId) };
      const maletas = await db.collection("maletas").find(filtro).toArray();

      res.status(200).json({ maletas });
    } else if (req.method === "POST") {
      // Crear una nueva maleta y asociarla a un pasajero existente
      const { pasajeroId, vuelo, maletaId, peso, despachada } = req.body;

      // Validar los datos recibidos
      if (!pasajeroId || !peso) {
        return res.status(400).json({ error: "pasajeroId y peso son campos obligatorios" });
      }

      // Verificar si el ID de pasajero es válido
      if (!ObjectId.isValid(pasajeroId)) {
        return res.status(400).json({ error: "ID de pasajero inválido" });
      }

      const nuevaMaleta = {
        pasajeroId: ObjectId(pasajeroId),
        maletaId: ObjectId(maletaId),
        peso: peso,
        vuelo: vuelo,
        despachada: false
      };

      await db.collection("maletas").insertOne(nuevaMaleta);

      // Actualizar la colección de pasajeros para incluir la nueva maleta
      // const filtro = { _id: ObjectId(pasajeroId) };
      // const actualizacion = { $push: { maletas: nuevaMaleta } };
      // await db.collection("pasajeros").updateOne(filtro, actualizacion);

      res.status(201).json({ message: "Maleta creada exitosamente", maleta: nuevaMaleta });
    } else {
      res.status(405).json({ error: "Método no permitido" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Se produjo un error en el servidor" });
  }
};
