const mongoose = require('mongoose');

const dbconnect = async () => {
    mongoose.set('strictQuery', true);
    try {
        // conexion a base de datos local
        // en la parte de mongodb://localhost:27017/sensor (en el caso de sensor es el nombre de la base de datos) 
        await mongoose.connect("mongodb://localhost:27017/sensor");
        console.log('Conexión correcta');
    } catch (err) {
        console.error('Error de conexión:', err);
    }
};

module.exports = dbconnect;
