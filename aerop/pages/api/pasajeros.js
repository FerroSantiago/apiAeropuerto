import clientPromise from "../../lib/mongodb";

export default async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("aeropuerto");

    //Encabezados CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
      // Añadir maletas a un pasajero existente
      const { id, maletas } = req.body;

      // Validar los datos recibidos
      if (!id || !maletas || !Array.isArray(maletas)) {
        return res.status(400).json({ error: "ID y maletas son campos obligatorios y maletas debe ser un array" });
      }

      // Validar que los elementos del array sean números decimales
      if (!maletas.every((peso) => typeof peso === "number" && Number.isFinite(peso))) {
        return res.status(400).json({ error: "El campo maletas debe contener solo números decimales" });
      }

      const filtro = { _id: id };
      const actualizacion = { $push: { maletas: { $each: maletas } } };

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
