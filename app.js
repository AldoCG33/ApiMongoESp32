const express=require('express');
const cors = require('cors');
const dbconnect = require('./config');
const ModelUSers = require('./models/model');
const Modelhuella =require('./models/modelhuellas');
const Modelosalones =require('./models/salones');


// configuracion de middelwares
const app=express();
app.use(express.json());
// se ocupa para solucionar el problema de las cors 
app.use(cors());   //agrega las cors a todas las rutas 


/**//////////**************************Rutas de la api ********************/ */

// rutas de laravel /****************funcional  */
app.post('/register', async(req, res) => {
    const body = req.body;

    // Verificar si el ID de la huella dactilar ya está en uso
    const existingUser = await ModelUSers.findOne({ huellaId: body.huellaId });
    if (existingUser) {
        return res.status(400).json({ message: 'El ID de la huella dactilar ya está en uso.' });
    }

    // Si el ID de la huella dactilar no está en uso, crear el nuevo usuario
    const user = new ModelUSers(body);
    const savedUser = await user.save();

    res.json(savedUser);
});
// fin de la ruta de laravel 

// metodo get para las huellas 
app.get('/idshuella', async (req, res) => {
    try {
        // Obtiene todos los documentos de la colección
        const huellas = await Modelhuella.find();

        // Extrae solo los IDs de los documentos
        const ids = huellas.map(huella => huella.id);

        // Envía los IDs como respuesta
        res.json(ids);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//guardar huellas en el modelo huellas
app.post('/huella', async (req, res) => {
    try {
      // Crear una nueva instancia del modelo con los datos del cuerpo de la solicitud
      const nuevaHuella = new Modelhuella({
        id: req.body.id
      });
  
      // Guardar la nueva huella en la base de datos
      const huellaGuardada = await nuevaHuella.save();
  
      // Enviar la huella guardada como respuesta
      res.status(201).json(huellaGuardada);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  

// ruta del ingreso de ids de la huella en a la api 
//ruta de validacion con ajax y jquery

// ruta validacion *******************************funcional
 app.get('/allHuellaIds', async (req, res) => {
    try {
      // Busca todos los usuarios y devuelve solo los campos huellaId
      const docs = await ModelUSers.find({}, 'huellaId');
      if (docs) {
        // Si los documentos existen, devuelve los campos huellaId
        res.json(docs.map(doc => doc.huellaId));
      } else {
        // Si no se encuentran documentos, devuelve un error 404
        res.status(404).json({ message: 'No se encontraron huellaId' });
      }
    } catch (err) {
      // Si hay un error, devuelve un error 500
      res.status(500).json({ message: err.message });
    }
  }); 


//   Rutas PARA LOS SALON
// prueba de jalar datos con la huella *************funcional
let salonOcupado = false;
let profesorActual = null;

app.get('/enrolarhuella/:id', async (req, res) => {
    try {
        const user = await ModelUSers.findOne({ huellaId: req.params.id });
        if (!user) {
            return res.status(404).send({ error: 'No se encontró un usuario con ese ID de huella' });
        }

        const userData = {
            nombre: user.nombre,
            app: user.app,
            apm: user.apm,
            // Añade la hora actual como hora de entrada o salida
            hora: new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
        };

        if (!salonOcupado) {
            salonOcupado = true;
            profesorActual = user;
            // Guarda la hora de entrada en el registro del profesor
            user.horaEntrada = userData.hora;
            await user.save();
            res.send({ message: 'Huella encontrada, salón ocupado', profesor: userData });
        } else if (profesorActual && profesorActual.huellaId === user.huellaId) {
            salonOcupado = false;
            profesorActual = null;
            // Guarda la hora de salida en el registro del profesor
            user.horaSalida = userData.hora;
            await user.save();
            res.send({ message: 'Huella encontrada, salón libre', profesor: userData });
        } else {
            res.send({ message: 'El salón ya está ocupado por otro profesor', profesor: userData });
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

// recibir datos del estatus del salon ***************funcional 
app.post('/recibirdatos', async (req, res) => {
    try {
      // Crear un nuevo documento en la colección 'Datosalon' con los datos recibidos
      const nuevoSalon = new Modelosalones({
        nombre: req.body.nombre,
        app: req.body.app,
        apm: req.body.apm,
        hora: req.body.hora,
        mensaje: req.body.mensaje
      });
  
      // Guardar el nuevo documento en la base de datos
      await nuevoSalon.save();
  
      // Enviar una respuesta de éxito con el documento guardado
      res.status(201).json({
        success: true,
        message: 'Datos recibidos y almacenados correctamente.',
        data: nuevoSalon
      });
    } catch (error) {
      // Enviar una respuesta de error si algo sale mal
      res.status(500).json({
        success: false,
        message: 'Error al procesar los datos recibidos.',
        error: error.message
      });
    }
  });

// Validaciones con la api d elos saloens ***********************funcional
app.get('/salon', async (req, res) => {
    try {
      const ultimoSalon = await Modelosalones.findOne().sort({ createdAt: -1 });
      res.json(ultimoSalon);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
// ruta para verificar la creacion de la api ************funcional
app.get('/',(req,res)=>{
    res.send("Hola mundo");
})


/**///********************fin de las rutas  */ */



// puerto en el que corre la api
const port = 3001;
app.listen(port, () => {
    console.log(`Servidor api corriendo en http://localhost:${port}`);
});


dbconnect();