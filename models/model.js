const mongoose = require('mongoose');
const userModel = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    app: {
        type: String,
        required: true
    },
    apm: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: true
    },
    contraseña: {
        type: String,
        required: true
    },
    huellaId: {
        type: String,
        required: true
    },
},
{
    timestamps:true,
}
);
const ModelUSers=mongoose.model('users',userModel);
module.exports=ModelUSers;