import clientPromise from "../../lib/mongodb";

export default async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("aeropuerto");

    //Encabezados CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Verificar si es una solicitud OPTIONS
    if (req.method === 'OPTIONS') {
      // Responder con un estado 200 OK para la solicitud OPTIONS
      return res.status(200).end();
    }

    if (req.method === "GET") {
      // Obtener todos los pasajeros
      const pasajeros = await db
        .collection("pasajeros")
        .find({})
        .sort({ vuelo: -1 })
        .toArray();

      res.json(pasajeros);
    } else if (req.method === "POST") {
      // Crear un nuevo pasajero
      const { nombre, numeroVuelo } = req.body;

      // Validar los datos recibidos
      if (!nombre || !numeroVuelo) {
        return res.status(400).json({ error: "Nombre y número de vuelo son campos obligatorios" });
      }

      const nuevoPasajero = {
        nombre,
        numeroVuelo,
        maletas: []
      };

      await db.collection("pasajeros").insertOne(nuevoPasajero);

      res.status(201).json({ message: "Pasajero creado exitosamente", pasajero: nuevoPasajero });
    } else if (req.method === "PUT") {
      // Añadir maleta a un pasajero existente
      const { id, maleta } = req.body;

      // Validar los datos recibidos
      if (!id || !maleta) {
        return res.status(400).json({ error: "ID y maletas son campos obligatorios y maleta debe ser un objeto" });
      }

      // Validar que los elementos del array sean números decimales
      if (typeof maleta.peso !== "number" || !Number.isFinite(maleta.peso)) {
        return res.status(400).json({ error: "El campo peso de la maleta debe ser un número decimal" });
      }

      const filtro = { _id: ObjectId(id) };
      const actualizacion = { $push: { maletas: maleta } };

      await db.collection("pasajeros").updateOne(filtro, actualizacion);

      res.status(200).json({ message: "Maletas añadidas exitosamente" });
    } else {
      res.status(405).json({ error: "Método no permitido" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Se produjo un error en el servidor" });
  }
};
