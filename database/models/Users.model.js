const mongoose = require('mongoose');

/**
 * Se crea un esquema para un usuario. Este usuario tendra las propiedades name, email, password.
 * Todas obligatorias, y todas aceptan un string.
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  lName:{
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  direction: {
    type: String,
    required: true,
  },
  tId:{
    type: String,
    required: true
  },
  id:{
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  pet:{
    type: Array,
    required: true
  }
});

module.exports = mongoose.model('User', userSchema);
